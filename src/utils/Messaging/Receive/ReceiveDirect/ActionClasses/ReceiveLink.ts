import {LinkParams, MessageStatus} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import {getConnection,updateConnectionOnNewMessage} from '@utils/Storage/connections';
import {displaySimpleNotification} from '@utils/Notifications';
import {ChatType,NewMessageCountAction} from '@utils/Storage/DBCalls/connections';
import {getChatPermissions} from '@utils/ChatPermissions';
import {handleAsyncLinkDownload} from '../HandleLinkDownload';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';

class ReceiveLink extends DirectReceiveAction {
  generatePreviewText(): string {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const text = getConnectionTextByContentType(
      this.decryptedMessageContent.contentType,
      this.decryptedMessageContent.data,
    );
    return text;
  }

  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    await this.doubleProcessingGuard();

    //save message to storage
    await this.saveMessage();
    // await this.sendReceiveUpdate();
    handleAsyncLinkDownload(
      this.chatId,
      this.decryptedMessageContent.messageId,
      this.receiveTime,
    );
    //update connection
    await updateConnectionOnNewMessage(
      {
        chatId: this.chatId,
        text: this.generatePreviewText(),
        readStatus: MessageStatus.latest,
        recentMessageType: this.decryptedMessageContent.contentType,
        latestMessageId: this.decryptedMessageContent.messageId,
        timestamp: this.receiveTime,
      },
      NewMessageCountAction.increment,
    );
    //notify user if notifications are ON
    const permissions = await getChatPermissions(this.chatId, ChatType.direct);
    await this.notify(permissions.notifications);
  }
  async notify(shouldNotify: boolean) {
    if (shouldNotify) {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      const connection = await getConnection(this.chatId);
      const notificationData = {
        title: connection.name,
        body: (this.decryptedMessageContent.data as LinkParams).text || '',
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

export default ReceiveLink;
