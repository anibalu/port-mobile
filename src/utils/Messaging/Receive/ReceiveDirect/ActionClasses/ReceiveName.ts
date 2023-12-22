import {NameParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import {getConnection, updateConnection} from '@utils/Connections';
import {DEFAULT_NAME} from '@configs/constants';
import {displaySimpleNotification} from '@utils/Notifications';
import {Permissions} from '@utils/ChatPermissions/interfaces';

class ReceiveName extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
    //update connection if name not present
    const connection = await getConnection(this.chatId);
    if (!connection.name || connection.name === '') {
      await updateConnection({
        chatId: this.chatId,
        name:
          (this.decryptedMessageContent.data as NameParams).name ||
          DEFAULT_NAME,
      });
      //notify user if notifications are ON
      this.notify(
        (connection.permissions as Permissions).notifications.toggled,
      );
    }
  }
  notify(shouldNotify: boolean) {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    if (shouldNotify) {
      const notificationData = {
        title: 'New connection',
        body:
          (this.decryptedMessageContent.data as NameParams).name ||
          DEFAULT_NAME + ' has connected with you.',
      };
      displaySimpleNotification(notificationData.title, notificationData.body);
    }
  }
}

export default ReceiveName;
