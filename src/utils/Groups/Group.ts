import {
  GroupData,
  GroupDataStrict,
  GroupMemberStrict,
  GroupMemberUpdate,
} from './interfaces';
import * as groupStorage from '@utils/Storage/group';
import * as memberStorage from '@utils/Storage/groupMembers';
import {
  addConnection,
  deleteConnection,
  updateConnection,
} from '@utils/Connections';
import {ChatType, ReadStatus} from '@utils/Connections/interfaces';
import {ContentType} from '@utils/Messaging/interfaces';
import {GroupPermissions} from '@utils/ChatPermissions/interfaces';
import {
  createChatPermissions,
  getDefaultPermissions,
} from '@utils/ChatPermissions';
import * as API from './APICalls';
import {NAME_LENGTH_LIMIT} from '@configs/constants';

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
      this.groupMembers = await memberStorage.getMembers(this.groupId);
    }
  }

  /**
   * attemps to create a group. throws error if fails
   * @param groupData - initial group data of group
   */
  public async createGroup(
    groupData: GroupDataStrict,
    presetId: string | null = null,
    permissions: GroupPermissions = getDefaultPermissions(ChatType.group),
  ) {
    this.groupId = await API.createGroup();
    this.groupData = groupData;
    await this.addGroup(permissions, presetId);
  }

  /**
   * attempts to join a group. throws error if fails
   * @param linkId - linkId of bundle used to join group
   * @param permissions - permissions the user wants for the group
   */
  public async joinGroup(
    linkId: string,
    groupData: GroupData,
    presetId: string | null = null,
    permissions: GroupPermissions = getDefaultPermissions(ChatType.group),
  ) {
    const response = await API.joinGroup(linkId, groupData);
    this.groupId = response.groupId;
    this.groupData = response.groupData;
    this.groupMembers = response.groupMembers;
    await this.addGroup(permissions, presetId);
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
   * @param permissions - permissions user wants for the group.
   */
  private async addGroup(
    permissions: GroupPermissions,
    presetId: string | null = null,
  ) {
    this.groupId = this.checkGroupIdNotNull();
    this.groupData = this.checkGroupDataNotNull();
    //update group storage
    await groupStorage.newGroup(this.groupId);
    await groupStorage.updateGroupData(this.groupId, this.groupData);
    //update member storage
    if (this.checkGroupMembersNotEmpty()) {
      const promises = this.groupMembers.map(member =>
        this.addGroupMember(member),
      );
      await Promise.all(promises);
    }
    //create permissions for group
    await createChatPermissions(
      this.groupId,
      ChatType.group,
      presetId,
      permissions,
    );
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
