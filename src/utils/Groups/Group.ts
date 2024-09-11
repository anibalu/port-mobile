import {defaultFolderId} from '@configs/constants';
import {createChatPermissionsFromFolderId} from '@utils/Storage/permissions';
import {
  GroupPermissions,
  Permissions,
} from '@utils/Storage/DBCalls/permissions/interfaces';
import {
  deleteConnection,
  getBasicConnectionInfo,
  getChatIdFromRoutingId,
} from '@utils/Storage/connections';
import {addConnection} from '@utils/Storage/connections';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';
import {
  getFileNameFromUri,
  getSafeAbsoluteURI,
  isAvatarUri,
  isMediaUri,
  moveToLargeFileDir,
} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import * as groupStorage from '@utils/Storage/group';
import * as memberStorage from '@utils/Storage/groupMembers';
import * as API from './APICalls';
import {deriveSharedSecret} from '@utils/Crypto/x25519';
import {generateISOTimeStamp} from '@utils/Time';
import * as permissionStorage from '@utils/Storage/permissions';
import {
  GroupData,
  GroupDataWithoutGroupId,
  GroupUpdateData,
} from '@utils/Storage/DBCalls/group';
import {
  GroupMemberLoadedData,
  GroupMemberUpdate,
} from '@utils/Storage/DBCalls/groupMembers';
import {generateRandomHexId} from '@utils/IdGenerator';
import {createPreview} from '@utils/ImageUtils';
import {
  deleteMedia,
  getMedia,
  saveNewMedia,
  updateMedia,
} from '@utils/Storage/media';
import LargeDataUpload from '@utils/Messaging/LargeData/LargeDataUpload';
import {addContact, updateContact} from '@utils/Storage/contacts';
import {ContactUpdate} from '@utils/Storage/DBCalls/contacts';
import {moveConnectionToNewFolderWithoutPermissionChange} from '@utils/ChatFolders';
import {deleteAllMessagesInChat} from '@utils/Storage/groupMessages';

class Group {
  private chatId: string | null;
  private groupData: GroupData | null;
  private groupMembers: GroupMemberLoadedData[];

  constructor(chatId: string | null = null) {
    this.chatId = chatId;
    this.groupData = null;
    this.groupMembers = [];
  }
  private checkChatIdNotNull(): string {
    if (!this.chatId) {
      throw new Error('NullChatId');
    }
    return this.chatId;
  }
  private checkGroupDataNotNull(): GroupData {
    if (!this.groupData) {
      throw new Error('NullGroupData');
    }
    return this.groupData;
  }
  /**
   * Ensures group data is not null by loading group data if not already loaded.
   */
  private async ensureGroupDataNotNull(): Promise<GroupData> {
    try {
      return this.checkGroupDataNotNull();
    } catch (error) {
      await this.loadGroupAttributes();
      return this.checkGroupDataNotNull();
    }
  }
  private checkGroupMembersNotEmpty(): boolean {
    if (this.groupMembers.length > 0) {
      return true;
    }
    return false;
  }
  private async loadGroupAttributes() {
    this.chatId = this.checkChatIdNotNull();
    const connection = await getBasicConnectionInfo(this.chatId);
    if (connection.connectionType !== ChatType.group) {
      throw new Error('Trying to load group from Direct chat connection');
    }
    this.groupData = await groupStorage.getGroupData(connection.routingId);
    this.groupMembers = await memberStorage.getMembers(connection.routingId);
    console.log();
  }

  public getChatId(): string {
    return this.checkChatIdNotNull();
  }

  /**
   * returns array of memberId and sharedSecret pairs.
   * @returns array of [memberId, sharedSecret]
   */
  public async loadGroupCryptoPairs() {
    await this.loadGroupAttributes();
    if (this.groupData?.groupId) {
      const cryptoIdPairs = await memberStorage.getGroupCryptoPairs(
        this.groupData?.groupId,
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
   * @param groupData - initial group data of group
   */
  public async createGroup(
    name: string,
    description: string | undefined | null,
    imageUri: string,
    folderId: string = defaultFolderId,
  ) {
    //create crypto info for group
    const cryptoDriver = new CryptoDriver();
    await cryptoDriver.create();
    const cryptoId = cryptoDriver.getCryptoId();
    //create permissions for group
    const permissionsId = await createChatPermissionsFromFolderId(folderId);
    try {
      //attempt to create group
      const groupId = await API.createGroup(await cryptoDriver.getPublicKey());
      console.log('groupId created: ', groupId);
      this.chatId = generateRandomHexId();
      this.groupData = {
        groupId: groupId,
        name: name,
        description: description,
        joinedAt: generateISOTimeStamp(),
        amAdmin: true,
        selfCryptoId: cryptoId,
        permissionsId: permissionsId,
        disconnected: false,
        initialMemberInfoReceived: true,
      };
      await this.addGroup(folderId);
      await this.saveGroupPicture(imageUri);
    } catch (error) {
      console.log('running cleanup. error creating a group', error);
      //run cleanup
      //cleanup cryptoId
      await cryptoDriver.deleteCryptoData();
      //cleanup permissions
      await permissionStorage.clearPermissions(permissionsId);
    }
  }

  /**
   * Saves group picture to group media storage
   * @param imageUri - image uri of the image
   * @returns - null if failure. avatar uri or media uri if succeeds.
   */
  private async saveGroupPicture(imageUri: string) {
    try {
      this.chatId = this.checkChatIdNotNull();
      this.groupData = await this.ensureGroupDataNotNull();
      //remove current group picture
      await this.removeGroupPicture();
      if (isAvatarUri(imageUri)) {
        await this.updateData({
          groupPicture: imageUri,
          groupPictureKey: null,
        });
        return;
      }
      //create local copy
      const groupPictureUri = await moveToLargeFileDir(
        this.chatId,
        imageUri,
        null,
      );
      //create local preview
      const groupPreviewUri = await createPreview(ContentType.image, {
        url: getSafeAbsoluteURI(groupPictureUri),
        chatId: this.chatId,
      });
      const mediaId = generateRandomHexId();
      //add to media table
      await saveNewMedia(mediaId, this.chatId, null, generateISOTimeStamp());
      await updateMedia(mediaId, {
        type: ContentType.displayImage,
        filePath: groupPictureUri,
        name: getFileNameFromUri(groupPictureUri),
        previewPath: groupPreviewUri,
      });
      await this.updateData({
        groupPicture: 'media://' + mediaId,
        groupPictureKey: null,
      });
    } catch (error) {
      console.log('Error saving group profile picture: ', error);
      return null;
    }
  }

  /**
   * Update group picture locally and attempt to upload it.
   * upload fails silently if it fails.
   * @param image
   */
  public async updateAndUploadPicture(imageUri: string) {
    await this.saveGroupPicture(imageUri);
    await this.uploadGroupPicture();
  }

  /**
   * Removes existing group picture.
   */
  private async removeGroupPicture() {
    this.chatId = this.checkChatIdNotNull();
    this.groupData = await this.ensureGroupDataNotNull();
    await deleteMedia(this.groupData.groupPicture);
    await this.updateData({groupPicture: null, groupPictureKey: null});
  }

  /**
   * Encrypts and uploads the group picture if the group picture is not an avatar.
   * Saves the encryption key in groups storage
   */
  public async uploadGroupPicture() {
    try {
      this.chatId = this.checkChatIdNotNull();
      this.groupData = await this.ensureGroupDataNotNull();
      if (isMediaUri(this.groupData.groupPicture)) {
        const media = await getMedia(this.groupData.groupPicture);
        if (!media) {
          throw new Error('No media associated with media Uri');
        }
        const uploader = new LargeDataUpload(media.filePath, media.name);
        await uploader.uploadGroupData(this.groupData.groupId);
        const key = uploader.getKeyNotNull();
        //encrypted group picture is uploaded. we now save the key in group table
        await this.updateData({
          groupPictureKey: key,
        });
      }
    } catch (error) {
      console.error('Error uploading group profile picture: ', error);
    }
  }

  /**
   * attempts to join a group. throws error if fails
   * @param linkId - linkId of bundle used to join group
   * @param groupData
   * @param folderId
   */
  public async joinGroup(
    linkId: string,
    groupData: GroupDataWithoutGroupId,
    folderId: string = defaultFolderId,
  ) {
    const cryptoDriver = new CryptoDriver(groupData.selfCryptoId);
    const pubKey = await cryptoDriver.getPublicKey();
    const response = await API.joinGroup(linkId, pubKey);
    console.log('response to joining a group: ', response);
    const groupId = response.groupId;
    //check if group already exists for the group Id
    const existingChatId = await getChatIdFromRoutingId(groupId);
    if (existingChatId) {
      const existingGroupData = await groupStorage.getGroupData(groupId);
      if (existingGroupData && existingGroupData.disconnected) {
        console.log('group is disconnected, attempting to re-join');
        //re-join group if disconnected.
        this.groupData = {
          ...groupData,
          groupId: groupId,
        };
        this.chatId = existingChatId;
        await this.performMemberHandshakes(
          response.groupMembersAuthData,
          groupData.selfCryptoId,
          groupData.joinedAt,
        );
        await this.rejoinGroup(folderId);
        return;
      } else {
        //if group is connected, don't do anything.
        return;
      }
    } else {
      //no group exists, so let's add a new group
      this.groupData = {
        ...groupData,
        groupId: groupId,
      };
      this.chatId = generateRandomHexId();
      await this.performMemberHandshakes(
        response.groupMembersAuthData,
        groupData.selfCryptoId,
        groupData.joinedAt,
      );
      await this.addGroup(folderId);
    }
  }

  /**
   * Generate shared secret with every member of the group and store member data in storage
   * @param groupMembersAuthData
   * @param selfCryptoId
   * @param handshakeTime
   */
  public async performMemberHandshakes(
    groupMembersAuthData: API.GroupMemberResponse[],
    selfCryptoId: string,
    handshakeTime: string,
  ) {
    const driver = new CryptoDriver(selfCryptoId);
    const driverData = await driver.getData();
    const promises = groupMembersAuthData.map(async memberInfo => {
      const sharedSecret = await deriveSharedSecret(
        driverData.privateKey,
        memberInfo.pubkey,
      );
      const memberCryptoDriver = new CryptoDriver();
      await memberCryptoDriver.createForMember({
        sharedSecret: sharedSecret,
      });
      const newMember: GroupMemberLoadedData = {
        memberId: memberInfo.memberId,
        pairHash: memberInfo.pairHash,
        joinedAt: handshakeTime,
        cryptoId: memberCryptoDriver.getCryptoId(),
        isAdmin: memberInfo.admin,
        deleted: false,
      };
      return newMember;
    });
    const groupMembers: GroupMemberLoadedData[] = await Promise.all(promises);
    this.groupMembers = groupMembers;
  }

  public async leaveGroup() {
    await this.loadGroupAttributes();
    this.groupData = this.checkGroupDataNotNull();
    if (await API.leaveGroup(this.groupData.groupId)) {
      await this.updateData({disconnected: true});
    }
  }

  public async removeMember(memberId: string) {
    await this.loadGroupAttributes();
    this.groupData = this.checkGroupDataNotNull();
    if (this.groupData.amAdmin) {
      await API.removeMember(this.groupData.groupId, memberId);
      await memberStorage.removeMember(this.groupData.groupId, memberId);
    } else {
      throw new Error('Not an admin to remove member');
    }
  }

  public async markMemberRemoved(memberId: string) {
    await this.loadGroupAttributes();
    this.groupData = this.checkGroupDataNotNull();
    await memberStorage.removeMember(this.groupData.groupId, memberId);
  }

  public async promoteMember(memberId: string) {
    await this.loadGroupAttributes();
    this.groupData = this.checkGroupDataNotNull();
    if (this.groupData.amAdmin) {
      if (
        await API.manageAdmin({
          groupId: this.groupData.groupId,
          promoteMember: memberId,
        })
      ) {
        await memberStorage.updateMember(this.groupData.groupId, memberId, {
          isAdmin: true,
        });
      }
    }
  }

  public async demoteMember(memberId: string) {
    await this.loadGroupAttributes();
    this.groupData = this.checkGroupDataNotNull();
    if (this.groupData.amAdmin) {
      if (
        await API.manageAdmin({
          groupId: this.groupData.groupId,
          demoteMember: memberId,
        })
      ) {
        await memberStorage.updateMember(this.groupData.groupId, memberId, {
          isAdmin: false,
        });
      }
    }
  }

  public getGroupId(): string | null {
    return this.groupData?.groupId || null;
  }

  public getGroupIdNotNull(): string {
    return this.checkGroupDataNotNull().groupId;
  }

  public async getData(): Promise<GroupData | null> {
    await this.loadGroupAttributes();
    return this.groupData;
  }

  public async getMembers(): Promise<GroupMemberLoadedData[]> {
    await this.loadGroupAttributes();
    return this.groupMembers;
  }

  public async getPermissions(): Promise<GroupPermissions> {
    this.groupData = await this.ensureGroupDataNotNull();
    const permissions = await permissionStorage.getPermissions(
      this.groupData.permissionsId,
    );
    return permissions as GroupPermissions;
  }

  public async updatePermissions(update: Permissions) {
    this.groupData = await this.ensureGroupDataNotNull();
    await permissionStorage.updatePermissions(
      this.groupData.permissionsId,
      update,
    );
  }

  public async getMember(
    memberId: string,
  ): Promise<GroupMemberLoadedData | null> {
    this.groupData = await this.ensureGroupDataNotNull();
    return memberStorage.getMember(this.groupData.groupId, memberId);
  }

  public async updateData(update: GroupUpdateData) {
    this.groupData = await this.ensureGroupDataNotNull();
    await groupStorage.updateGroupData(this.groupData.groupId, update);
    if (update.groupPicture || update.groupPicture === null) {
      await groupStorage.updateGroupPicture(
        this.groupData.groupId,
        update.groupPicture,
      );
    }
    if (update.groupPictureKey || update.groupPictureKey === null) {
      await groupStorage.updateGroupPictureKey(
        this.groupData.groupId,
        update.groupPictureKey,
      );
    }
    await this.loadGroupAttributes();
  }

  /**
   * Update a member's group relevant info.
   * @param memberId
   * @param update
   */
  public async updateMemberData(memberId: string, update: GroupMemberUpdate) {
    this.groupData = await this.ensureGroupDataNotNull();
    await memberStorage.updateMember(this.groupData.groupId, memberId, update);
    await this.loadGroupAttributes();
  }

  /**
   * Update a member's contact info
   * @param memberId
   * @param contactUpdate
   */
  public async updateMemberContactData(
    memberId: string,
    contactUpdate: ContactUpdate,
  ) {
    const groupMember = await this.getMember(memberId);
    if (groupMember) {
      //we don't support overwriting names unless done via the contact profile screen.
      if (groupMember.name) {
        await updateContact(groupMember.pairHash, {
          ...contactUpdate,
          name: groupMember.name,
        });
      } else {
        await updateContact(groupMember.pairHash, contactUpdate);
      }
    }
    await this.loadGroupAttributes();
  }

  /**
   * Deletes a group and associated data
   * @todo - clean delete associated data like messages, permissions, crypto, media, etc.
   */
  public async deleteGroup() {
    await this.loadGroupAttributes();
    this.chatId = this.checkChatIdNotNull();
    this.groupData = await this.ensureGroupDataNotNull();
    if (this.groupData.disconnected) {
      //clean delete messages
      await deleteAllMessagesInChat(this.chatId);
      //delete group members and their crypto data
      const allMemberIds = await memberStorage.getAllMemberIds(
        this.groupData.groupId,
      );
      for (let index = 0; index < allMemberIds.length; index++) {
        const memberId = allMemberIds[index];
        await this.deleteGroupMember(memberId);
      }
      //delete group and associated data
      const groupCrypto = new CryptoDriver(this.groupData.selfCryptoId);
      await groupCrypto.deleteCryptoData();
      await groupStorage.deleteGroupData(this.groupData.groupId);
      //delete connection
      await deleteConnection(this.chatId);
      this.chatId = null;
      this.groupData = null;
      this.groupMembers = [];
    } else {
      throw new Error('Group is still connected');
    }
  }

  /**
   * helper to update storage attributes when a group is created or joined.
   * @param folderId - folder user wants to put the group in.
   */
  private async addGroup(folderId: string) {
    this.chatId = this.checkChatIdNotNull();
    this.groupData = this.checkGroupDataNotNull();
    //add to group storage
    await groupStorage.addGroup(this.groupData);
    //update member storage
    if (this.checkGroupMembersNotEmpty()) {
      const promises = this.groupMembers.map(member =>
        this.saveGroupMember(member),
      );
      await Promise.all(promises);
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
    });
  }

  /**
   * helper to update storage attributes when a group is re-joined.
   * @param folderId - folder user wants to put the group in.
   */
  private async rejoinGroup(folderId: string) {
    this.chatId = this.checkChatIdNotNull();
    this.groupData = this.checkGroupDataNotNull();
    //update group storage
    await groupStorage.updateGroupData(this.groupData.groupId, {
      ...this.groupData,
    });
    //update member storage
    if (this.checkGroupMembersNotEmpty()) {
      const promises = this.groupMembers.map(member =>
        this.saveOrUpdateGroupMember(member),
      );
      await Promise.all(promises);
    }
    await moveConnectionToNewFolderWithoutPermissionChange(
      this.chatId,
      folderId,
    );
  }

  /**
   * Cleanly deletes data associated with a group member.
   * @param memberId
   */
  public async deleteGroupMember(memberId: string) {
    this.groupData = await this.ensureGroupDataNotNull();
    const memberData = await memberStorage.getMember(
      this.groupData.groupId,
      memberId,
    );
    if (memberData) {
      const existingCrypto = new CryptoDriver(memberData.cryptoId);
      await existingCrypto.deleteCryptoData();
      await memberStorage.deleteMember(this.groupData.groupId, memberId);
    }
  }

  /**
   * helper to update storage with new group member.
   * @param member - member to add to group
   * @todo - add contact entry
   */
  public async saveGroupMember(member: GroupMemberLoadedData) {
    this.groupData = await this.ensureGroupDataNotNull();
    await memberStorage.newMember(this.groupData.groupId, member);
    await addContact({
      pairHash: member.pairHash,
      name: member.name,
      displayPic: member.displayPic,
      connectedOn: generateISOTimeStamp(),
    });
  }

  /**
   * helper to update storage with new group member.
   * @param member - member to add to group
   * @todo - add contact entry
   */
  public async saveOrUpdateGroupMember(member: GroupMemberLoadedData) {
    this.groupData = await this.ensureGroupDataNotNull();
    const existingMemberData = await memberStorage.getMember(
      this.groupData.groupId,
      member.memberId,
    );
    if (existingMemberData) {
      await memberStorage.updateMember(
        this.groupData.groupId,
        member.memberId,
        member,
      );
      const existingCrypto = new CryptoDriver(existingMemberData.cryptoId);
      await existingCrypto.deleteCryptoData();
      await addContact({
        pairHash: member.pairHash,
        name: member.name,
        displayPic: member.displayPic,
        connectedOn: generateISOTimeStamp(),
      });
    } else {
      await memberStorage.newMember(this.groupData.groupId, member);
      await addContact({
        pairHash: member.pairHash,
        name: member.name,
        displayPic: member.displayPic,
        connectedOn: generateISOTimeStamp(),
      });
    }
  }

  /**
   * helper to add new group member.
   * @param member - member to add to group
   */
  public async addGroupMember(member: API.GroupMemberResponse) {
    this.groupData = await this.ensureGroupDataNotNull();
    //perform handshake
    const driver = new CryptoDriver(this.groupData.selfCryptoId);
    const driverData = await driver.getData();
    const sharedSecret = await deriveSharedSecret(
      driverData.privateKey,
      member.pubkey,
    );
    const memberCryptoDriver = new CryptoDriver();
    await memberCryptoDriver.createForMember({
      sharedSecret: sharedSecret,
    });
    //@todo check name and profile picture from pair hash comparison
    await this.saveGroupMember({
      memberId: member.memberId,
      pairHash: member.pairHash,
      isAdmin: member.admin,
      joinedAt: generateISOTimeStamp(),
      cryptoId: memberCryptoDriver.getCryptoId(),
      deleted: false,
    });
  }
}

export default Group;
