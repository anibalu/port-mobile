// this is to receieve a contact bundle request
import DirectReceiveAction from '../DirectReceiveAction';
import {
  ContactBundleRequestParams,
  MessageStatus,
} from '@utils/Messaging/interfaces';
import {approveContactShareIfPermitted} from '@utils/ContactSharing';
import {getConnection, updateConnectionOnNewMessage} from '@utils/Connections';
import {ChatType} from '@utils/Connections/interfaces';
import {getChatPermissions} from '@utils/ChatPermissions';
import {displaySimpleNotification} from '@utils/Notifications';
import {NewMessageCountAction} from '@utils/Storage/DBCalls/connections';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';

class ReceiveContactBundleRequest extends DirectReceiveAction {
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

    const {destinationName} = this.decryptedMessageContent
      .data as ContactBundleRequestParams;

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
      NewMessageCountAction.increment,
    );

    await approveContactShareIfPermitted(
      this.chatId,
      destinationName,
      this.decryptedMessageContent.messageId,
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
          (this.decryptedMessageContent.data as ContactBundleRequestParams)
            .destinationName + ' has requested your contact',
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

export default ReceiveContactBundleRequest;
