import {MessageStatus, TextParams} from '@utils/Messaging/interfaces';
import {getConnection} from '@utils/Storage/connections';
import {updateConnectionOnNewMessage} from '@utils/Storage/connections';
import {displaySimpleNotification} from '@utils/Notifications';
import {
  ChatType,
  NewMessageCountAction,
} from '@utils/Storage/DBCalls/connections';
import GroupReceiveAction from '../GroupReceiveAction';
import {getChatPermissions} from '@utils/ChatPermissions';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';

class ReceiveText extends GroupReceiveAction {
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
    //update connection
    await updateConnectionOnNewMessage(
      {
        chatId: this.chatId,
        text: (this.decryptedMessageContent.data as TextParams).text || '',
        readStatus: MessageStatus.latest,
        recentMessageType: this.decryptedMessageContent.contentType,
        latestMessageId: this.decryptedMessageContent.messageId,
        timestamp: this.receiveTime,
      },
      NewMessageCountAction.increment,
    );
    //notify user if notifications are ON
    const permissions = await getChatPermissions(this.chatId, ChatType.group);
    await this.notify(permissions.notifications);
  }
  async notify(shouldNotify: boolean) {
    if (shouldNotify) {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      const senderName = await this.getSenderName();
      const connection = await getConnection(this.chatId);
      displaySimpleNotification(
        connection.name,
        (this.decryptedMessageContent.data as TextParams).text || '',
        !connection.disconnected,
        this.chatId,
        true,
        senderName,
      );
    }
  }
}

export default ReceiveText;
