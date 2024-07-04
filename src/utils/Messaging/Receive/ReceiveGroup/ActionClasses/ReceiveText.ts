import {MessageStatus, TextParams} from '@utils/Messaging/interfaces';
import {getConnection, updateConnectionOnNewMessage} from '@utils/Connections';
import {displaySimpleNotification} from '@utils/Notifications';
import {ChatType} from '@utils/Connections/interfaces';
import GroupReceiveAction from '../GroupReceiveAction';
import {getChatPermissions} from '@utils/ChatPermissions';

class ReceiveText extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
    //update connection
    await updateConnectionOnNewMessage({
      chatId: this.chatId,
      text: (this.decryptedMessageContent.data as TextParams).text || '',
      readStatus: MessageStatus.latest,
      recentMessageType: this.decryptedMessageContent.contentType,
      latestMessageId: this.decryptedMessageContent.messageId,
      timestamp: this.receiveTime,
    });
    //notify user if notifications are ON
    const permissions = await getChatPermissions(this.chatId, ChatType.group);
    await this.notify(permissions.notifications);
  }
  async notify(shouldNotify: boolean) {
    if (shouldNotify) {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      const connection = await getConnection(this.chatId);
      const notificationData = {
        title: connection.name,
        body: (this.decryptedMessageContent.data as TextParams).text || '',
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

export default ReceiveText;
