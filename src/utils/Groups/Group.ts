import {NAME_LENGTH_LIMIT, defaultFolderId} from '@configs/constants';
import {createChatPermissionsFromFolderId} from '@utils/ChatPermissions';
import {GroupPermissions, Permissions} from '@utils/ChatPermissions/interfaces';
import {
  addConnection,
  deleteConnection,
  updateConnection,
} from '@utils/Connections';
import {ChatType, ReadStatus} from '@utils/Connections/interfaces';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {ContentType} from '@utils/Messaging/interfaces';
import {getRandomAvatarInfo} from '@utils/Profile';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import * as groupStorage from '@utils/Storage/group';
import * as memberStorage from '@utils/Storage/groupMembers';
import * as API from './APICalls';
import {
  GroupData,
  GroupDataStrict,
  GroupMemberStrict,
  GroupMemberUpdate,
} from './interfaces';
import {deriveSharedSecret} from '@utils/Crypto/x25519';
import {FileAttributes} from '@utils/Storage/interfaces';
import {generateISOTimeStamp} from '@utils/Time';
import {
  clearPermissions,
  getPermissions,
  updatePermissions,
} from '@utils/Storage/permissions';

class Group {
  private groupId: string | null;
  private groupData: GroupDataStrict | null;
  private groupMembers: GroupMemberStrict[];
  constructor(groupId: string | null = null) {
    this.groupId = groupId;
    this.groupData = null;
    this.groupMembers = [];
  }
  private checkGroupIdNotNull(): string {
    if (!this.groupId) {
      throw new Error('NullGroupId');
    }
    return this.groupId;
  }
  private checkGroupDataNotNull(): GroupDataStrict {
    if (!this.groupData) {
      throw new Error('NullGroupData');
    }
    return this.groupData;
  }
  private checkGroupMembersNotEmpty(): boolean {
    if (this.groupMembers.length > 0) {
      return true;
    }
    return false;
  }
  private async loadGroupAttributes() {
    if (this.groupId) {
      this.groupData = await groupStorage.getGroupData(this.groupId);
      if (this.groupData?.groupPicture) {
        this.groupData.groupPicture = this.groupData.groupPicture.includes(
          'avatar://',
        )
          ? this.groupData.groupPicture
          : getSafeAbsoluteURI(this.groupData.groupPicture, 'doc');
      }
      this.groupMembers = await memberStorage.getMembers(this.groupId);
    }
  }

  public async loadGroupCryptoPairs() {
    console.log('Group id is: ', this.groupId);
    if (this.groupId) {
      const cryptoIdPairs = await memberStorage.getGroupCryptoPairs(
        this.groupId,
      );
      for (const crypto of cryptoIdPairs) {
        const obj = new CryptoDriver(crypto[1]);
        crypto[1] = (await obj.getMemberData()).sharedSecret;
      }
      return cryptoIdPairs;
    } else {
      return [];
    }
  }

  /**
   * attemps to create a group. throws error if fails.
   * Currently does not support group pictures
   * @param groupData - initial group data of group
   */
  public async createGroup(
    name: string,
    description: string | undefined | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    image: FileAttributes | null = null,
    folderId: string = defaultFolderId,
  ) {
    const cryptoDriver = new CryptoDriver();
    await cryptoDriver.create();
    const cryptoId = cryptoDriver.getCryptoId();
    const permissionsId = await createChatPermissionsFromFolderId(folderId);
    try {
      this.groupId = await API.createGroup(await cryptoDriver.getPublicKey());
      this.groupData = {
        name: name,
        description: description,
        joinedAt: generateISOTimeStamp(),
        //TODO: add group picture support
        groupPicture: null,
        amAdmin: true,
        selfCryptoId: cryptoId,
        permissionsId: permissionsId,
      };
      await this.addGroup(folderId);
    } catch (error) {
      //run cleanup
      //cleanup cryptoId
      await cryptoDriver.deleteCryptoData();
      //cleanup permissions
      await clearPermissions(permissionsId);
      this.groupId = null;
    }
  }

  /**
   * attempts to join a group. throws error if fails
   * @param linkId - linkId of bundle used to join group
   * @param permissions - permissions the user wants for the group
   */
  public async joinGroup(
    linkId: string,
    groupData: GroupDataStrict,
    folderId: string = defaultFolderId,
  ) {
    const cryptoDriver = new CryptoDriver(groupData.selfCryptoId);
    const pubKey = await cryptoDriver.getPublicKey();
    const response = await API.joinGroup(linkId, pubKey);
    this.groupId = response.groupId;
    await this.performMemberHandshakes(
      response.groupMembersAuthData,
      groupData.selfCryptoId,
      groupData.joinedAt,
    );
    await this.addGroup(folderId);
  }

  /**
   * Generate shared secret with every member of the group and store member data in storage
   * @param groupMembersAuthData
   * @param selfCryptoId
   * @param handshakeTime
   */
  public async performMemberHandshakes(
    groupMembersAuthData: string[][],
    selfCryptoId: string,
    handshakeTime: string,
  ) {
    const driver = new CryptoDriver(selfCryptoId);
    const driverData = await driver.getData();
    const promises = groupMembersAuthData.map(async memberPair => {
      const sharedSecret = await deriveSharedSecret(
        driverData.privateKey,
        memberPair[1],
      );
      const memberCryptoDriver = new CryptoDriver();
      await memberCryptoDriver.createForMember({
        sharedSecret: sharedSecret,
      });
      const newMember: GroupMemberStrict = {
        memberId: memberPair[0],
        name: null,
        joinedAt: handshakeTime,
        cryptoId: memberCryptoDriver.getCryptoId(),
        isAdmin: null,
      };
      return newMember;
    });
    const groupMembers: GroupMemberStrict[] = await Promise.all(promises);
    this.groupMembers = groupMembers;
  }

  public async leaveGroup() {
    this.groupId = this.checkGroupIdNotNull();
    if (await API.leaveGroup(this.groupId)) {
      await updateConnection({chatId: this.groupId, disconnected: true});
    }
  }

  public async removeMember(memberId: string) {
    this.groupId = this.checkGroupIdNotNull();
    await this.loadGroupAttributes();
    this.groupData = this.checkGroupDataNotNull();
    if (this.groupData.amAdmin) {
      if (await API.removeMember(this.groupId, memberId)) {
        await memberStorage.removeMember(this.groupId, memberId);
      }
    }
  }
  public async markMemberRemoved(memberId: string) {
    this.groupId = this.checkGroupIdNotNull();
    await this.loadGroupAttributes();
    this.groupData = this.checkGroupDataNotNull();
    await memberStorage.removeMember(this.groupId, memberId);
  }
  public getGroupId(): string | null {
    return this.groupId;
  }
  public getGroupIdNotNull(): string {
    return this.checkGroupIdNotNull();
  }
  public async getData(): Promise<GroupDataStrict | null> {
    await this.loadGroupAttributes();
    return this.groupData;
  }

  public async getMembers(): Promise<GroupMemberStrict[]> {
    await this.loadGroupAttributes();
    return this.groupMembers;
  }
  public async getPermissions(): Promise<GroupPermissions> {
    this.groupId = this.checkGroupIdNotNull();
    await this.loadGroupAttributes();
    if (this.groupData) {
      const permissions = await getPermissions(this.groupData.permissionsId);
      return permissions as GroupPermissions;
    }
    throw new Error('No permissions setup for group');
  }
  public async updatePermissions(update: Permissions) {
    this.groupId = this.checkGroupIdNotNull();
    await this.loadGroupAttributes();
    if (this.groupData) {
      await updatePermissions(this.groupData.permissionsId, update);
    }
  }
  public async getMember(memberId: string): Promise<GroupMemberStrict | null> {
    this.groupId = this.checkGroupIdNotNull();
    return memberStorage.getMember(this.groupId, memberId);
  }

  public async updateData(update: GroupData) {
    this.groupId = this.checkGroupIdNotNull();
    await groupStorage.updateGroupData(this.groupId, update);
    await this.loadGroupAttributes();
  }

  public async updateMemberData(memberId: string, update: GroupMemberUpdate) {
    this.groupId = this.checkGroupIdNotNull();
    await memberStorage.updateMember(this.groupId, memberId, update);
    await this.loadGroupAttributes();
  }

  public async updateMemberName(memberId: string, newName: string) {
    await this.updateMemberData(memberId, {
      name: newName.trim().slice(0, NAME_LENGTH_LIMIT),
    });
    await this.loadGroupAttributes();
  }

  public async deleteGroup() {
    this.groupId = this.checkGroupIdNotNull();
    await groupStorage.deleteGroupData(this.groupId);
    await deleteConnection(this.groupId);
    this.groupId = null;
    this.groupData = null;
    this.groupMembers = [];
  }

  /**
   * helper to update storage attributes when a group is created or joined.
   * @param folderId - folder user wants to put the group in.
   */
  private async addGroup(folderId: string = defaultFolderId) {
    this.groupId = this.checkGroupIdNotNull();
    this.groupData = this.checkGroupDataNotNull();
    //update group storage
    await groupStorage.newGroup(this.groupId);
    await groupStorage.updateGroupData(this.groupId, this.groupData);
    //update member storage
    if (this.checkGroupMembersNotEmpty()) {
      console.log('Adding in members: ', this.groupMembers);
      const promises = this.groupMembers.map(member =>
        this.addGroupMember(member),
      );
      await Promise.all(promises);
    }
    //add connection
    await addConnection({
      chatId: this.groupId,
      connectionType: ChatType.group,
      name: this.groupData.name,
      recentMessageType: ContentType.newChat,
      readStatus: ReadStatus.new,
      authenticated: true,
      disconnected: false,
      timestamp: this.groupData.joinedAt,
      newMessageCount: 0,
      pathToDisplayPic: getRandomAvatarInfo().fileUri,
      folderId: folderId,
    });
  }

  /**
   * helper to update storage with new group member.
   * @param member - member to add to group
   */
  public async addGroupMember(member: GroupMemberStrict) {
    this.groupId = this.checkGroupIdNotNull();
    await memberStorage.newMember(this.groupId, member.memberId);
    await memberStorage.updateMember(this.groupId, member.memberId, member);
  }
}

export default Group;
