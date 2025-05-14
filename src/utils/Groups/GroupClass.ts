import {defaultFolderId} from '@configs/constants';

import {moveConnectionToNewFolderWithoutPermissionChange} from '@utils/ChatFolders';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {generateRandomHexId} from '@utils/IdGenerator';
import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';
import {
  addConnection,
  deleteConnection,
  getBasicConnectionInfo,
  getChatIdFromRoutingId,
} from '@utils/Storage/connections';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import {
  GroupData,
  GroupDataWithoutGroupId,
  GroupUpdateData,
} from '@utils/Storage/DBCalls/group';
import {GroupMemberLoadedData} from '@utils/Storage/DBCalls/groupMembers';
import {
  GroupPermissions,
  Permissions,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import * as groupStorage from '@utils/Storage/group';
import * as memberStorage from '@utils/Storage/groupMembers';
import {deleteAllMessagesInChat} from '@utils/Storage/groupMessages';
import {deleteMedia} from '@utils/Storage/media';
import * as permissionStorage from '@utils/Storage/permissions';
import {createChatPermissionsFromFolderId} from '@utils/Storage/permissions';
import {isAvatarUri} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {generateISOTimeStamp} from '@utils/Time';

import * as API from './APICalls';
import GroupMember from './GroupMemberClass';
import {saveGroupImage, uploadGroupImage} from './groupPicture';
import {performHandshakes} from './handshake';

class Group {
  private chatId: string;
  private groupData: GroupData;
  private groupMembers: GroupMemberLoadedData[];

  /**
   * Group class to help manage a group.
   * @param chatId - chatId of the group chat.
   * @param groupData - info associated with the group.
   * @param groupMembers - list of group members and their associated info.
   */
  constructor(
    chatId: string,
    groupData: GroupData,
    groupMembers: GroupMemberLoadedData[],
  ) {
    this.chatId = chatId;
    this.groupData = groupData;
    this.groupMembers = groupMembers;
  }

  /**
   * Load up an existing group.
   * @param chatId - chatId associated with the group chat.
   * @returns - group class.
   * @throws - error if load fails.
   */
  static async load(chatId: string): Promise<Group> {
    const connection = await getBasicConnectionInfo(chatId);
    //If connection is not a group, throw an exception.
    if (connection.connectionType !== ChatType.group) {
      throw new Error('Trying to load direct chat as group');
    }
    //If groupId does not exist, throw an exception.
    if (!connection.routingId) {
      throw new Error('No groupId associated with chatId');
    }
    const groupData = await groupStorage.getGroupData(connection.routingId);
    //If group data could not be found, throw an exception.
    if (!groupData) {
      throw new Error('No group info associated with groupId');
    }
    //Fetch active group members
    const groupMembers = await memberStorage.getMembers(connection.routingId);
    return new Group(chatId, groupData, groupMembers);
  }

  /**
   * Create a new group with the provided attributes.
   * @param name - name of the new group.
   * @param description - description of the new group.
   * @param imageUri - group picture of the new group.
   * @param folderId - folder the new group chat should go to.
   * @returns - group class.
   * @throws - error if creation fails.
   */
  static async create(
    name: string,
    description: string | undefined | null,
    imageUri: string,
    folderId: string = defaultFolderId,
  ): Promise<Group> {
    //create crypto info for group
    const cryptoDriver = new CryptoDriver();
    await cryptoDriver.create();
    const cryptoId = cryptoDriver.getCryptoId();
    //create permissions for group
    const permissionsId = await createChatPermissionsFromFolderId(folderId);
    try {
      //attempt to create group
      const groupId = await API.createGroup(await cryptoDriver.getPublicKey());
      const chatId = generateRandomHexId();
      const groupData = {
        groupId: groupId,
        name: name,
        description: description,
        joinedAt: generateISOTimeStamp(),
        amAdmin: true,
        selfCryptoId: cryptoId,
        permissionsId: permissionsId,
        disconnected: false,
        //we mark this as true because all the info associated with the group is created by us.
        initialMemberInfoReceived: true,
      };
      const group = new Group(chatId, groupData, []);
      await group.save(folderId);
      await group.saveGroupPicture(imageUri);
      return group;
    } catch (error) {
      console.error('[Error in group creation]: ', error);
      //run cleanup
      //cleanup cryptoId
      await cryptoDriver.deleteCryptoData();
      //cleanup permissions
      await permissionStorage.clearPermissions(permissionsId);
      throw new Error('Group creation failed');
    }
  }

  /**
   * Join an existing group.
   * @param linkId - group port Id used to join group.
   * @param groupData - data associated with the group.
   * @param folderId - folder the joined group chat should go to.
   * @returns - group class.
   */
  static async join(
    linkId: string,
    fromGroupSuperPort: boolean,
    groupData: GroupDataWithoutGroupId,
    folderId: string = defaultFolderId,
  ): Promise<Group> {
    const cryptoDriver = new CryptoDriver(groupData.selfCryptoId);
    const pubKey = await cryptoDriver.getPublicKey();
    const response = fromGroupSuperPort
      ? await API.joinGroupFromSuperport(linkId, pubKey)
      : await API.joinGroup(linkId, pubKey);
    const groupId = response.groupId;
    const groupMembers = await performHandshakes(
      response.groupMembersAuthData,
      groupData.selfCryptoId,
      groupData.joinedAt,
    );
    //check if group already exists for the group Id
    const existingChatId = await getChatIdFromRoutingId(groupId);
    if (existingChatId) {
      const existingGroupData = await groupStorage.getGroupData(groupId);
      //If chat exist and is still connected, stop the join process and return existing group.
      if (existingGroupData && !existingGroupData.disconnected) {
        return await Group.load(existingChatId);
      }
      //re-join group if disconnected.
      console.log('[group is disconnected, attempting to re-join]');
      const group = new Group(
        existingChatId,
        {...groupData, groupId: groupId},
        groupMembers,
      );
      await group.resave(folderId);
      return group;
    }
    //If no group exists, add a new group
    const group = new Group(
      generateRandomHexId(),
      {...groupData, groupId: groupId},
      groupMembers,
    );
    await group.save(folderId);
    return group;
  }

  /**
   * Deletes a group and all associated data.
   * @param chatId - chatId of the group chat.
   */
  static async delete(chatId: string) {
    const group = await Group.load(chatId);
    const groupData = group.getGroupData();
    //only perform delete if group is already disconnected.
    if (!groupData.disconnected) {
      throw new Error('Group is still connected');
    }
    //clean delete messages
    await deleteAllMessagesInChat(chatId);
    //delete group members and their crypto data
    const allMemberIds = await memberStorage.getAllMemberIds(groupData.groupId);
    for (const memberId of allMemberIds) {
      await GroupMember.delete(groupData.groupId, memberId);
    }
    //delete group and associated data
    const groupCrypto = new CryptoDriver(groupData.selfCryptoId);
    await groupCrypto.deleteCryptoData();
    await groupStorage.deleteGroupData(groupData.groupId);
    await permissionStorage.clearPermissions(groupData.permissionsId);
    //delete connection
    await deleteConnection(chatId);
  }

  /**
   * Save a newly created or joined group to local storage
   * @param folderId - folder the group chat should go to.
   */
  private async save(folderId: string) {
    //add to group storage
    await groupStorage.addGroup(this.groupData);
    //add group members
    for (const member of this.groupMembers) {
      await GroupMember.save(this.groupData.groupId, member);
    }
    //add connection
    await addConnection({
      chatId: this.chatId,
      connectionType: ChatType.group,
      recentMessageType: ContentType.newChat,
      readStatus: MessageStatus.latest,
      timestamp: this.groupData.joinedAt,
      newMessageCount: 0,
      routingId: this.groupData.groupId,
      folderId: folderId,
      pairHash: '',
    });
  }

  /**
   * Re-save a re-connected group with updated information.
   * @param folderId - folder the re-connected group chat should go to.
   */
  private async resave(folderId: string) {
    //update group storage
    await groupStorage.updateGroupData(this.groupData.groupId, this.groupData);
    //add or update group members
    for (const member of this.groupMembers) {
      await GroupMember.save(this.groupData.groupId, member);
    }
    //move connection to new folder specified by folderId.
    await moveConnectionToNewFolderWithoutPermissionChange(
      this.chatId,
      folderId,
    );
  }

  /**
   * Update a group's data.
   * @param update - group data being updated.
   */
  public async updateGroupData(update: GroupUpdateData) {
    //update group data.
    await groupStorage.updateGroupData(this.groupData.groupId, update);
    //update group picture.
    if (update.groupPicture || update.groupPicture === null) {
      await groupStorage.updateGroupPicture(
        this.groupData.groupId,
        update.groupPicture,
      );
    }
    //update group picture key.
    if (update.groupPictureKey || update.groupPictureKey === null) {
      await groupStorage.updateGroupPictureKey(
        this.groupData.groupId,
        update.groupPictureKey,
      );
    }
    const groupData = await groupStorage.getGroupData(this.groupData.groupId);
    //If group data could not be found, throw an exception.
    if (!groupData) {
      throw new Error('No group info associated with groupId');
    }
    this.groupData = groupData;
  }

  /**
   * Removes existing group picture.
   */
  private async removeGroupPicture() {
    await deleteMedia(this.groupData.groupPicture);
    await this.updateGroupData({groupPicture: null, groupPictureKey: null});
  }

  /**
   * Saves group picture to group media storage
   * @param imageUri - image uri of the image
   */
  public async saveGroupPicture(imageUri: string) {
    try {
      //remove current group picture
      await this.removeGroupPicture();
      //If group picture is an avatar, update group data and return.
      if (isAvatarUri(imageUri)) {
        await this.updateGroupData({
          groupPicture: imageUri,
          groupPictureKey: null,
        });
        return;
      }
      //If group picture is an actual picture.
      const mediaId = await saveGroupImage(this.chatId, imageUri);
      //update group data with media Id and return.
      await this.updateGroupData({
        groupPicture: 'media://' + mediaId,
        groupPictureKey: null,
      });
    } catch (error) {
      console.log('[Error saving group picture]: ', error);
      return;
    }
  }

  /**
   * Encrypts and uploads the group picture if the group picture is not an avatar.
   * Saves the encryption key in groups storage.
   */
  public async uploadGroupPicture() {
    const key = await uploadGroupImage(
      this.groupData.groupId,
      this.groupData.groupPicture,
    );
    if (key) {
      //encrypted group picture is uploaded. we now save the encryption key in group table
      await this.updateGroupData({
        groupPictureKey: key,
      });
    }
  }

  /**
   * Get group permissions.
   * @returns - permissions granted to the group.
   */
  public async getPermissions(): Promise<GroupPermissions> {
    const permissions = await permissionStorage.getPermissions(
      this.groupData.permissionsId,
    );
    return permissions as GroupPermissions;
  }

  /**
   * Update group permissions.
   * @param update - permissions to be udpated.
   */
  public async updatePermissions(update: Permissions) {
    await permissionStorage.updatePermissions(
      this.groupData.permissionsId,
      update,
    );
  }

  /**
   * Leave a group.
   */
  public async leaveGroup() {
    if (await API.leaveGroup(this.groupData.groupId)) {
      await this.updateGroupData({disconnected: true});
    }
  }

  /**
   * Get a group member class for a group member.
   * @param memberId - memberId of the group member.
   * @returns - group member class.
   */
  public async getGroupMember(memberId: string): Promise<GroupMember> {
    return await GroupMember.load(this.groupData.groupId, memberId);
  }

  /**
   * Get a group member's data if a group member with a matching memberId exists.
   * @param memberId - memberId of the group member.
   * @returns - group member data.
   */
  public getGroupMemberData(memberId: string): GroupMemberLoadedData | null {
    const member = this.groupMembers.find(x => x.memberId === memberId);
    if (member) {
      return member;
    }
    return null;
  }

  /**
   * Get chatId associated with the group.
   * @returns - chatId
   */
  public getChatId(): string {
    return this.chatId;
  }

  /**
   * Get info associated with the group.
   * @returns - group info
   */
  public getGroupData(): GroupData {
    return this.groupData;
  }

  /**
   * Get info of active members in the group.
   * @returns - active group members and their info.
   */
  public getGroupMembers(): GroupMemberLoadedData[] {
    return this.groupMembers;
  }

  /**
   * Get the number of active members in the group.
   * @returns - number of active members in the group.
   */
  public getGroupMemberCount(): number {
    return this.groupMembers.length + 1;
  }

  /**
   * Get the groupId associated with the group.
   * @returns - groupId
   */
  public getGroupId(): string {
    return this.groupData.groupId;
  }

  /**
   * Get [memberId, sharedSecret] array for all active group members.
   * @returns - [memberId, sharedSecret] array for all active group members.
   */
  public async getMemberCryptoPairs(): Promise<string[][]> {
    const cryptoIdPairs = await memberStorage.getGroupCryptoPairs(
      this.groupData.groupId,
    );
    for (const crypto of cryptoIdPairs) {
      const obj = new CryptoDriver(crypto[1]);
      crypto[1] = (await obj.getMemberData()).sharedSecret;
    }
    return cryptoIdPairs;
  }
}

export default Group;
