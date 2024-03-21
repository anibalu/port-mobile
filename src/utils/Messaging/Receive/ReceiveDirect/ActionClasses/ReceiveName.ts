import {NameParams} from '@utils/Messaging/interfaces';
import DirectReceiveAction from '../DirectReceiveAction';
import {updateConnection} from '@utils/Connections';
import {DEFAULT_NAME} from '@configs/constants';
import {displaySimpleNotification} from '@utils/Notifications';
import {getChatPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Connections/interfaces';
import DirectChat from '@utils/DirectChats/DirectChat';

class ReceiveName extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    //save message to storage
    await this.saveMessage();
    //update connection
    await updateConnection({
      chatId: this.chatId,
      name:
        (this.decryptedMessageContent.data as NameParams).name || DEFAULT_NAME,
    });
    const chat = new DirectChat(this.chatId);
    await chat.updateName(
      (this.decryptedMessageContent.data as NameParams).name || DEFAULT_NAME,
    );
    //notify user if notifications are ON
    const permissions = await getChatPermissions(this.chatId, ChatType.direct);
    this.notify(permissions.notifications);
  }
  notify(shouldNotify: boolean) {
    if (shouldNotify) {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      const notificationData = {
        title: 'New connection',
        body:
          (this.decryptedMessageContent.data as NameParams).name ||
          DEFAULT_NAME + ' has connected with you.',
      };
      displaySimpleNotification(
        notificationData.title,
        notificationData.body,
        true,
        this.chatId,
      );
    }
  }
}

export default ReceiveName;
