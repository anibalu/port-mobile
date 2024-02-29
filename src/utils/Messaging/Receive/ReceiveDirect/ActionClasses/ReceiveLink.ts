import {LinkParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import {getConnection, updateConnectionOnNewMessage} from '@utils/Connections';
import {displaySimpleNotification} from '@utils/Notifications';
import {ChatType, ReadStatus} from '@utils/Connections/interfaces';
import {getChatPermissions} from '@utils/ChatPermissions';
import {handleAsyncLinkDownload} from '../HandleLinkDownload';

class ReceiveLink extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
    handleAsyncLinkDownload(
      this.chatId,
      this.decryptedMessageContent.messageId,
      this.receiveTime,
    );
    //update connection
    await updateConnectionOnNewMessage({
      chatId: this.chatId,
      text: (this.decryptedMessageContent.data as LinkParams).text || '',
      readStatus: ReadStatus.new,
      recentMessageType: this.decryptedMessageContent.contentType,
      latestMessageId: this.decryptedMessageContent.messageId,
    });
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
