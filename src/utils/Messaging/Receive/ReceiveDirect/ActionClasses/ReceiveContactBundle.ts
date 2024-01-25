// this is to receieve the final contact bundle
import {getConnection, updateConnectionOnNewMessage} from '@utils/Connections';
import DirectReceiveAction from '../DirectReceiveAction';
import {ContactBundleParams} from '@utils/Messaging/interfaces';
import {ChatType, ReadStatus} from '@utils/Connections/interfaces';
import {displaySimpleNotification} from '@utils/Notifications';
import {getChatPermissions} from '@utils/ChatPermissions';
class ReceiveContactBundle extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
    await updateConnectionOnNewMessage({
      chatId: this.chatId,
      text:
        'contact of ' +
        (this.decryptedMessageContent.data as ContactBundleParams).name +
        ' shared',
      readStatus: ReadStatus.new,
      recentMessageType: this.decryptedMessageContent.contentType,
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
        body:
          'contact of ' +
          (this.decryptedMessageContent.data as ContactBundleParams).name +
          ' shared',
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
