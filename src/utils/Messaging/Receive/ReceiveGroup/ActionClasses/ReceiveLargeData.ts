import {getConnection} from '@utils/Storage/connections';
import {updateConnectionOnNewMessage} from '@utils/Storage/connections';
import {LargeDataParams, MessageStatus} from '@utils/Messaging/interfaces';

import {getChatPermissions} from '@utils/ChatPermissions';
import {GroupPermissions} from '@utils/Storage/DBCalls/permissions/interfaces';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import {displaySimpleNotification} from '@utils/Notifications';
import GroupReceiveAction from '../GroupReceiveAction';
import {handleAsyncMediaDownload} from '../HandleMediaDownload';

class ReceiveLargeData extends GroupReceiveAction {
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
    const permissions = await getChatPermissions(this.chatId, ChatType.group);

    await this.downloadMessage(permissions);
    //update connection
    await this.updateConnection();
    //notify user
    this.notify(permissions.notifications, connection);
  }
  async downloadMessage(permissions: GroupPermissions): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();

    const data: LargeDataParams = {
      ...(this.decryptedMessageContent.data as LargeDataParams),
      shouldDownload: permissions.autoDownload,
    };

    //By default, we add in a message to the DB without waiting to download media
    await this.saveMessage(data);

    //If autodownload is on, we do the following async
    if (permissions.autoDownload) {
      handleAsyncMediaDownload(
        this.chatId,
        this.decryptedMessageContent.messageId,
      );
    }
  }
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    return (
      (this.decryptedMessageContent.data as LargeDataParams).text ||
      'received large data: ' +
        (this.decryptedMessageContent.data as LargeDataParams).fileName
    );
  }

  async updateConnection(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await updateConnectionOnNewMessage({
      chatId: this.chatId,
      readStatus: MessageStatus.latest,
      recentMessageType: this.decryptedMessageContent.contentType,
      text: this.generatePreviewText(),
      latestMessageId: this.decryptedMessageContent.messageId,
      timestamp: this.receiveTime,
    });
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
        true,
      );
    }
  }
}

export default ReceiveLargeData;
