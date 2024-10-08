import Contact from '@utils/Contacts/Contact';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {ContactUpdate} from '@utils/Storage/DBCalls/contacts';
import {
  GroupMemberLoadedData,
  GroupMemberUpdate,
} from '@utils/Storage/DBCalls/groupMembers';
import * as memberStorage from '@utils/Storage/groupMembers';
import {generateISOTimeStamp} from '@utils/Time';
import * as API from './APICalls';
import * as groupStorage from '@utils/Storage/group';
import {performHandshake} from './handshake';

class GroupMember {
  private groupId: string;
  private member: GroupMemberLoadedData;

  /**
   * Group member class used to manage group members.
   * @param groupId - groupId of the group.
   * @param member - info associated with the member.
   */
  constructor(groupId: string, member: GroupMemberLoadedData) {
    this.groupId = groupId;
    this.member = member;
  }

  /**
   * Fetch data associated with a group member.
   * @param groupId - groupId of the group.
   * @param memberId - memberId of the group member.
   * @throws - error if no member exists matching provided groupId and memberId.
   */
  private static async fetch(
    groupId: string,
    memberId: string,
  ): Promise<GroupMemberLoadedData> {
    const member = await memberStorage.getMember(groupId, memberId);
    if (!member) {
      throw new Error('No member info found for groupId and memberId');
    }
    return member;
  }

  /**
   * Load up a group member class.
   * @param groupId - groupId of the group.
   * @param memberId - memberId of the group member.
   * @returns - group member class.
   * @throws - error if no member exists matching provided groupId and memberId.
   */
  static async load(groupId: string, memberId: string) {
    return new GroupMember(groupId, await GroupMember.fetch(groupId, memberId));
  }

  /**
   * Add a new group member to the group.
   * @param groupId - groupId of the group.
   * @param selfCryptoId - cryptoId of the user for the group.
   * @param member - member auth data required for handshake.
   * @returns - group member class.
   */
  static async add(
    groupId: string,
    selfCryptoId: string,
    member: API.GroupMemberResponse,
  ): Promise<GroupMember> {
    //load up our keys for the group.
    const driver = new CryptoDriver(selfCryptoId);
    const driverData = await driver.getData();
    const newMember = await performHandshake(
      member,
      driverData,
      generateISOTimeStamp(),
    );
    await GroupMember.save(groupId, newMember);
    return await GroupMember.load(groupId, member.memberId);
  }

  /**
   * Save a group member.
   * If member already exist, this operation overwrites existing member data.
   * @param groupId - groupId of the group.
   * @param member - group member being added.
   */
  static async save(
    groupId: string,
    member: GroupMemberLoadedData,
  ): Promise<void> {
    try {
      const groupMember = await GroupMember.load(groupId, member.memberId);
      //If cryptoId has changed, delete old crypto data.
      if (member.cryptoId !== groupMember.getMember().cryptoId) {
        const existingCrypto = new CryptoDriver(
          groupMember.getMember().cryptoId,
        );
        await existingCrypto.deleteCryptoData();
      }
      //update data.
      await groupMember.updateMemberData(member);
    } catch (error) {
      //If there is no existing member, we add to group members storage.
      await memberStorage.newMember(groupId, member);
    }
    //add to contacts
    await Contact.add({
      pairHash: member.pairHash,
      name: member.name,
      displayPic: member.displayPic,
      connectedOn: generateISOTimeStamp(),
    });
  }

  /**
   * Delete a group member from a group.
   * @param groupId - groupId of the group.
   * @param memberId - memberId of the member.
   */
  static async delete(groupId: string, memberId: string) {
    try {
      const groupMember = await GroupMember.load(groupId, memberId);
      const existingCrypto = new CryptoDriver(groupMember.getMember().cryptoId);
      await existingCrypto.deleteCryptoData();
      await memberStorage.deleteMember(groupId, memberId);
    } catch (error) {
      console.error('[Error deleting group member]: ', memberId, error);
    }
  }

  /**
   * Checks if the user has admin priveledges to perform certain group member actions.
   */
  private async amAdmin(): Promise<boolean> {
    try {
      const groupData = await groupStorage.getGroupData(this.groupId);
      if (!groupData) {
        throw new Error('No group data found for groupId');
      }
      return groupData.amAdmin;
    } catch (error) {
      console.error('[Error checking if user is admin]: ', error);
      return false;
    }
  }

  /**
   * Update a group member's data.
   * @param update - group member's data to update.
   */
  public async updateMemberData(update: GroupMemberUpdate) {
    await memberStorage.updateMember(
      this.groupId,
      this.member.memberId,
      update,
    );
    this.member = await GroupMember.fetch(this.groupId, this.member.memberId);
  }

  /**
   * Update a group member's contact data.
   * @param update - group member's contact data to update.
   */
  public async updateMemberContactData(update: ContactUpdate) {
    const contact = await Contact.load(this.member.pairHash);
    //we don't support overwriting names unless done via the contact profile screen.
    if (update.name) {
      await contact.addContactName(update.name);
    } else {
      await contact.updateContact(update);
    }
    this.member = await GroupMember.fetch(this.groupId, this.member.memberId);
  }

  /**
   * Remove a group member and mark member as removed if the operation succeeds.
   */
  public async removeMember() {
    if (!this.amAdmin()) {
      throw new Error('Not an admin to perform remove operation');
    }
    await API.removeMember(this.groupId, this.member.memberId);
    await this.markMemberRemoved();
  }

  /**
   * Mark a member as removed.
   */
  public async markMemberRemoved() {
    await memberStorage.removeMember(this.groupId, this.member.memberId);
    this.member = await GroupMember.fetch(this.groupId, this.member.memberId);
  }

  /**
   * Promote a member as admin.
   */
  public async promoteMember() {
    if (!this.amAdmin()) {
      throw new Error('Not an admin to perform promote operation');
    }
    if (
      await API.manageAdmin({
        groupId: this.groupId,
        promoteMember: this.member.memberId,
      })
    ) {
      await this.updateMemberData({isAdmin: true});
    }
  }

  /**
   * Dismiss a member as admin.
   * @param memberId
   */
  public async demoteMember() {
    if (!this.amAdmin()) {
      throw new Error('Not an admin to perform demote operation');
    }
    if (
      await API.manageAdmin({
        groupId: this.groupId,
        demoteMember: this.member.memberId,
      })
    ) {
      await this.updateMemberData({isAdmin: false});
    }
  }

  /**
   * Get info associated with group member.
   * @returns - group member info.
   */
  public getMember(): GroupMemberLoadedData {
    return this.member;
  }

  /**
   * Get groupId associated with group member.
   * @returns - groupId
   */
  public getGroupId(): string {
    return this.groupId;
  }
}

export default GroupMember;
