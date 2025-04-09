import store from '@store/appStore';

import Group from '@utils/Groups/Group';
import {generateRandomHexId} from '@utils/IdGenerator';
import {DataType, MessageStatus} from '@utils/Messaging/interfaces';
import {GroupMessageData} from '@utils/Storage/DBCalls/groupMessage';
import * as storage from '@utils/Storage/groupMessages';
import {saveNewMedia} from '@utils/Storage/media';

import GroupReceiveAction from '../GroupReceiveAction';
import {handleAsyncMediaDownload} from '../HandleMediaDownload';

class ReceiveMemberPicture extends GroupReceiveAction {
  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await this.doubleProcessingGuard();
    await this.saveMessage();
    this.handleDownload();
  }
  //actual download and post process step.
  async handleDownload(): Promise<void> {
    try {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      const localMediaId = await handleAsyncMediaDownload(
        this.chatId,
        this.decryptedMessageContent.messageId,
      );
      if (!localMediaId) {
        throw new Error('Local media Id not created');
      }
      const chat = new Group(this.chatId);
      await chat.updateMemberContactData(this.senderId, {
        displayPic: 'media://' + localMediaId,
      });
      store.dispatch({
        type: 'PING',
        payload: 'PONG',
      });
    } catch (error) {
      console.log('Error downloading media: ', error);
    }
  }

  async saveMessage(data?: DataType) {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const localMediaId = generateRandomHexId();
    const savedMessage: GroupMessageData = {
      chatId: this.chatId,
      messageId: this.decryptedMessageContent.messageId,
      data: data || this.decryptedMessageContent.data,
      contentType: this.decryptedMessageContent.contentType,
      timestamp: this.receiveTime,
      sender: false,
      memberId: this.senderId,
      messageStatus: MessageStatus.delivered,
      replyId: this.decryptedMessageContent.replyId,
      expiresOn: this.decryptedMessageContent.expiresOn,
      mediaId: localMediaId,
    };
    //Create a media entry in DB for the same
    await saveNewMedia(
      localMediaId,
      this.chatId,
      this.decryptedMessageContent.messageId,
      this.receiveTime,
    );
    await storage.saveGroupMessage(savedMessage);
  }
}

export default ReceiveMemberPicture;
