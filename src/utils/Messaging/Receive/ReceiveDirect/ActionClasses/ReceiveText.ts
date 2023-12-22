import {TextParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import {getConnection, updateConnectionOnNewMessage} from '@utils/Connections';
import {displaySimpleNotification} from '@utils/Notifications';
import {Permissions} from '@utils/ChatPermissions/interfaces';
import {ReadStatus} from '@utils/Connections/interfaces';

class ReceiveText extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
    //update connection
    await updateConnectionOnNewMessage({
      chatId: this.chatId,
      text: (this.decryptedMessageContent.data as TextParams).text || '',
      readStatus: ReadStatus.new,
      recentMessageType: this.decryptedMessageContent.contentType,
    });
    //notify user if notifications are ON
    await this.notify();
  }
  async notify() {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const connection = await getConnection(this.chatId);
    if ((connection.permissions as Permissions).notifications.toggled) {
      const notificationData = {
        title: connection.name,
        body: (this.decryptedMessageContent.data as TextParams).text || '',
      };
      displaySimpleNotification(notificationData.title, notificationData.body);
    }
  }
}

export default ReceiveText;
