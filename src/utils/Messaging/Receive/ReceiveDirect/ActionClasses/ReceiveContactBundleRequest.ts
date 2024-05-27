// this is to receieve a contact bundle request
import DirectReceiveAction from '../DirectReceiveAction';
import {ContactBundleRequestParams} from '@utils/Messaging/interfaces';
import {respondToShareContactRequest} from '@utils/ContactSharing';
import {getConnection, updateConnectionOnNewMessage} from '@utils/Connections';
import {ChatType, ReadStatus} from '@utils/Connections/interfaces';
import {getChatPermissions} from '@utils/ChatPermissions';
import {displaySimpleNotification} from '@utils/Notifications';

class ReceiveContactBundleRequest extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();

    const {destinationName, source} = this.decryptedMessageContent
      .data as ContactBundleRequestParams;

    //save message to storage
    await this.saveMessage();
    await updateConnectionOnNewMessage({
      chatId: this.chatId,
      text:
        (this.decryptedMessageContent.data as ContactBundleRequestParams)
          .destinationName + 'has requested your contact',
      readStatus: ReadStatus.new,
      recentMessageType: this.decryptedMessageContent.contentType,
      latestMessageId: this.decryptedMessageContent.messageId,
      timestamp: this.receiveTime,
    });
    //notify user if notifications are ON
    const permissions = await getChatPermissions(this.chatId, ChatType.direct);
    await this.notify(permissions.notifications);

    await respondToShareContactRequest(
      this.chatId,
      destinationName,
      source,
      this.decryptedMessageContent.messageId,
    );
  }
  async notify(shouldNotify: boolean) {
    if (shouldNotify) {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      const connection = await getConnection(this.chatId);
      const notificationData = {
        title: connection.name,
        body:
          (this.decryptedMessageContent.data as ContactBundleRequestParams)
            .destinationName + 'has requested your contact',
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
