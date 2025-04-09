import store from '@store/appStore';

import Group from '@utils/Groups/Group';
import {ContentType} from '@utils/Messaging/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {getProfileInfo} from '@utils/Profile';
import {isAvatarUri} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

import GroupReceiveAction from '../GroupReceiveAction';

class AddMember extends GroupReceiveAction {
  async performAction(): Promise<void> {
    //add new member to member list
    const groupHandler = new Group(this.chatId);
    await groupHandler.addGroupMember({
      memberId: this.content.newMember,
      pairHash: this.content.pairHash,
      pubkey: this.content.pubkey,
      admin: this.content.isAdmin,
    });
    store.dispatch({
      type: 'NEW_CONNECTION',
      payload: {
        groupId: this.groupId,
        connectionLinkId: this.receiveTime,
      },
    });
    const groupData = await groupHandler.getData();
    if (!groupData) {
      throw new Error('Group data not found');
    }
    console.log('added new member to group');
    //send group picture if you're the admin and group picture exists
    if (groupData.amAdmin && groupData.groupPicture) {
      const sender = isAvatarUri(groupData.groupPicture)
        ? new SendMessage(
            this.chatId,
            ContentType.groupAvatar,
            {fileUri: groupData.groupPicture},
            undefined,
            undefined,
            this.content.newMember,
          )
        : groupData.groupPictureKey
        ? new SendMessage(
            this.chatId,
            ContentType.groupPicture,
            {groupPictureKey: groupData.groupPictureKey},
            undefined,
            undefined,
            this.content.newMember,
          )
        : null;
      if (sender) {
        sender.send();
      }
    }
    //send your name and profile picture to the new member
    const profileInfo = await getProfileInfo();
    const members = (await groupHandler.getMembers())
      .filter(x => x.memberId !== this.content.newMember)
      .map(x => {
        return {name: x.name, memberId: x.memberId};
      });
    if (profileInfo) {
      const sender = new SendMessage(
        this.chatId,
        ContentType.groupInitialMemberInfo,
        {senderName: profileInfo.name, members: members},
        undefined,
        undefined,
        this.content.newMember,
      );
      sender.send();
      const profilePicturePermission = (await groupHandler.getPermissions())
        .displayPicture;
      if (profilePicturePermission) {
        const sender = isAvatarUri(profileInfo.profilePicInfo.fileUri)
          ? new SendMessage(
              this.chatId,
              ContentType.displayAvatar,
              {
                ...profileInfo.profilePicInfo,
                fileType: 'avatar',
              },
              undefined,
              undefined,
              this.content.newMember,
            )
          : new SendMessage(
              this.chatId,
              ContentType.displayImage,
              {
                ...profileInfo.profilePicInfo,
              },
              undefined,
              undefined,
              this.content.newMember,
            );
        //send asynchronously
        sender.send();
      }
    }
  }
}

export default AddMember;
