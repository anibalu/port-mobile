import store from '@store/appStore';

import {getChatPermissions} from '@utils/ChatPermissions';
import DirectChat from '@utils/DirectChats/DirectChat';
import {generateRandomHexId} from '@utils/IdGenerator';
import {DataType, MessageStatus} from '@utils/Messaging/interfaces';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';
import {saveNewMedia} from '@utils/Storage/media';
import * as storage from '@utils/Storage/messages';

import DirectReceiveAction from '../DirectReceiveAction';
import {handleAsyncMediaDownload} from '../HandleMediaDownload';

class ReceiveDisplayImage extends DirectReceiveAction {
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
      const chat = new DirectChat(this.chatId);
      await chat.updateDisplayPic('media://' + localMediaId);
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
    const savedMessage: LineMessageData = {
      chatId: this.chatId,
      messageId: this.decryptedMessageContent.messageId,
      data: data || this.decryptedMessageContent.data,
      contentType: this.decryptedMessageContent.contentType,
      timestamp: this.receiveTime,
      sender: false,
      messageStatus: MessageStatus.delivered,
      replyId: this.decryptedMessageContent.replyId,
      expiresOn: this.decryptedMessageContent.expiresOn,
      shouldAck:
        ((await getChatPermissions(this.chatId, ChatType.direct))
          .readReceipts as boolean) || false,
      mediaId: localMediaId,
    };
    //Create a media entry in DB for the same
    await saveNewMedia(
      localMediaId,
      this.chatId,
      this.decryptedMessageContent.messageId,
      this.receiveTime,
    );
    await storage.saveMessage(savedMessage);
  }
}

export default ReceiveDisplayImage;
