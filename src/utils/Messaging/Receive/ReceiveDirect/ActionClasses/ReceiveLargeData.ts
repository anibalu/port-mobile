import {getChatPermissions} from '@utils/ChatPermissions';
import {DirectPermissions} from '@utils/ChatPermissions/interfaces';
import {getConnection, updateConnectionOnNewMessage} from '@utils/Connections';
import {ChatType, ConnectionInfo} from '@utils/Connections/interfaces';
import {LargeDataParams, MessageStatus} from '@utils/Messaging/interfaces';
import {displaySimpleNotification} from '@utils/Notifications';
import DirectReceiveAction from '../DirectReceiveAction';
import {handleAsyncMediaDownload} from '../HandleMediaDownload';
import store from '@store/appStore';
import {NewMessageCountAction} from '@utils/Storage/DBCalls/connections';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';

class ReceiveLargeData extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
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
    const permissions = await getChatPermissions(this.chatId, ChatType.direct);

    await this.downloadMessage(permissions);

    //update connection
    await this.updateConnection();
    //notify user
    this.notify(permissions.notifications, connection);
  }
  async downloadMessage(permissions: DirectPermissions): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();

    const data: LargeDataParams = {
      ...(this.decryptedMessageContent.data as LargeDataParams),
      shouldDownload: permissions.autoDownload,
      previewUri: undefined,
    };

    //By default, we add in a message to the DB without waiting to download media
    await this.saveMessage(data);

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
  notify(shouldNotify: boolean, connection: ConnectionInfo): void {
    if (shouldNotify) {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      const notificationData = {
        title: connection.name,
        body: this.generatePreviewText(),
      };
      displaySimpleNotification(
        notificationData.title,
        notificationData.body,
        !connection.disconnected,
        this.chatId,
      );
    }
  }
}

export default ReceiveLargeData;
