import Group from '@utils/Groups/Group';
import GroupReceiveAction from '../GroupReceiveAction';
import {ContentType, GroupPictureParams} from '@utils/Messaging/interfaces';
import LargeDataDownload from '@utils/Messaging/LargeData/LargeDataDownload';
import {createPreview} from '@utils/ImageUtils';
import {getFileNameFromUri} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {saveNewMedia, updateMedia} from '@utils/Storage/media';
import {generateRandomHexId} from '@utils/IdGenerator';
import store from '@store/appStore';

class ReceiveGroupPicture extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save group picture key
    const chat = new Group(this.chatId);
    const member = await chat.getMember(this.senderId);
    console.log('member details: ', member);
    if (member && member.isAdmin) {
      await chat.updateData({
        groupPictureKey: (
          this.decryptedMessageContent.data as GroupPictureParams
        ).groupPictureKey,
      });
      this.handleDownload();
    }
  }
  //actual download and post process step.
  async handleDownload(): Promise<void> {
    try {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      const chat = new Group(this.chatId);
      const groupData = await chat.getData();
      if (groupData?.groupPictureKey) {
        console.log('downloading group picture');
        //download and decrypt group picture
        const downloader = new LargeDataDownload(
          this.chatId,
          ContentType.image,
          '',
          groupData.groupPictureKey,
        );
        await downloader.downloadGroupData(this.groupId);
        const fileUri = downloader.getDownloadedFilePath();
        console.log('downloaded group picture: ', fileUri);
        //generate preview path for images, videos and display pictures.
        const previewConfig = {
          chatId: this.chatId,
          url: fileUri,
        };
        const previewPath = await createPreview(
          ContentType.displayImage,
          previewConfig,
        );
        //Create a media entry in DB for the same
        const mediaId = generateRandomHexId();
        await saveNewMedia(
          mediaId,
          this.chatId,
          this.decryptedMessageContent.messageId,
          this.receiveTime,
        );
        //Saves relative URIs for the paths
        await updateMedia(mediaId, {
          type: ContentType.groupPicture,
          name: getFileNameFromUri(fileUri),
          filePath: fileUri,
          previewPath: previewPath,
        });
        await chat.updateData({groupPicture: 'media://' + mediaId});
        //ping necessary because this function runs asynchronously.
        store.dispatch({
          type: 'PING',
          payload: 'PONG',
        });
      }
    } catch (error) {
      console.log('Error downloading media: ', error);
    }
  }
}

export default ReceiveGroupPicture;
