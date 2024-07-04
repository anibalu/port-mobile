// this is to receieve the final contact bundle
import {getConnection, updateConnectionOnNewMessage} from '@utils/Connections';
import DirectReceiveAction from '../DirectReceiveAction';
import {ContactBundleParams, MessageStatus} from '@utils/Messaging/interfaces';
import {ChatType} from '@utils/Connections/interfaces';
import {displaySimpleNotification} from '@utils/Notifications';
import {getChatPermissions} from '@utils/ChatPermissions';
import {NewMessageCountAction} from '@utils/Storage/DBCalls/connections';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';
class ReceiveContactBundle extends DirectReceiveAction {
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
    //save message to storage
    await this.saveMessage();
    await updateConnectionOnNewMessage(
      {
        chatId: this.chatId,
        text: this.generatePreviewText(),
        readStatus: MessageStatus.latest,
        recentMessageType: this.decryptedMessageContent.contentType,
        latestMessageId: this.decryptedMessageContent.messageId,
        timestamp: this.receiveTime,
      },
      NewMessageCountAction.unchanged,
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
        body:
          'contact of ' +
          (this.decryptedMessageContent.data as ContactBundleParams).bundle
            .name +
          ' has been shared with you',
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

export default ReceiveContactBundle;
