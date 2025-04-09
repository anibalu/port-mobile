import store from '@store/appStore';

import {getChatPermissions} from '@utils/ChatPermissions';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';
import {generateRandomHexId} from '@utils/IdGenerator';
import {
  DataType,
  LargeDataParams,
  MessageStatus,
} from '@utils/Messaging/interfaces';
import {displaySimpleNotification} from '@utils/Notifications';
import {getConnection,updateConnectionOnNewMessage} from '@utils/Storage/connections';
import {ChatType,ConnectionInfo,NewMessageCountAction} from '@utils/Storage/DBCalls/connections';
import {GroupMessageData} from '@utils/Storage/DBCalls/groupMessage';
import {GroupPermissions} from '@utils/Storage/DBCalls/permissions/interfaces';
import * as storage from '@utils/Storage/groupMessages';
import {saveNewMedia} from '@utils/Storage/media';

import GroupReceiveAction from '../GroupReceiveAction';
import {handleAsyncMediaDownload} from '../HandleMediaDownload';

class ReceiveLargeData extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await this.doubleProcessingGuard();

    //if media Id doesn't exist, throw error.
    if (
      !(this.decryptedMessageContent.data as LargeDataParams).mediaId ||
      !(this.decryptedMessageContent.data as LargeDataParams).key
    ) {
      throw new Error('MediaIdOrKeyNull');
    }
    //get connection info
    const connection = await getConnection(this.chatId);
    //autodownload or not based on permission
    const permissions = await getChatPermissions(this.chatId, ChatType.group);

    await this.downloadMessage(permissions);

    //update connection
    await this.updateConnection();
    //notify user
    await this.notify(permissions.notifications, connection);
  }

  async downloadMessage(permissions: GroupPermissions): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();

    const data: LargeDataParams = {
      ...(this.decryptedMessageContent.data as LargeDataParams),
      shouldDownload: permissions.autoDownload,
      previewUri: undefined,
    };

    //By default, we add in a message to the DB without waiting to download media
    await this.saveMessage(data);
    // await this.sendReceiveUpdate();

    //If autodownload is on, we do the following async
    if (permissions.autoDownload) {
      this.handleDownload();
    }
  }

  //actual download and post process step.
  async handleDownload(): Promise<void> {
    try {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      await handleAsyncMediaDownload(
        this.chatId,
        this.decryptedMessageContent.messageId,
      );
      store.dispatch({
        type: 'PING',
        payload: 'PONG',
      });
    } catch (error) {
      console.log('Error downloading media: ', error);
    }
  }

  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();

    const messageData = this.decryptedMessageContent.data as LargeDataParams;
    const text = getConnectionTextByContentType(
      this.decryptedMessageContent.contentType,
      messageData,
    );
    return text;
  }

  async updateConnection(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await updateConnectionOnNewMessage(
      {
        chatId: this.chatId,
        readStatus: MessageStatus.latest,
        recentMessageType: this.decryptedMessageContent.contentType,
        text: this.generatePreviewText(),
        latestMessageId: this.decryptedMessageContent.messageId,
        timestamp: this.receiveTime,
      },
      NewMessageCountAction.increment,
    );
  }
  async notify(shouldNotify: boolean, connection: ConnectionInfo) {
    if (shouldNotify) {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      const senderName = await this.getSenderName();
      displaySimpleNotification(
        connection.name,
        this.generatePreviewText(),
        !connection.disconnected,
        this.chatId,
        true,
        senderName,
      );
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
    await storage.saveGroupMessage(savedMessage);
    //Create a media entry in DB for the same
    await saveNewMedia(
      localMediaId,
      this.chatId,
      this.decryptedMessageContent.messageId,
      this.receiveTime,
    );
  }
}

export default ReceiveLargeData;
