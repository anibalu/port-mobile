import {DEFAULT_NAME} from '@configs/constants';

import {getChatPermissions} from '@utils/ChatPermissions';
import DirectChat from '@utils/DirectChats/DirectChat';
import {
  ContentType,
  MessageStatus,
  NameParams,
} from '@utils/Messaging/interfaces';
import {displaySimpleNotification} from '@utils/Notifications';
import {updateConnectionOnNewMessage} from '@utils/Storage/connections';
import {ChatType,NewMessageCountAction} from '@utils/Storage/DBCalls/connections';

import DirectReceiveAction from '../DirectReceiveAction';

class ReceiveName extends DirectReceiveAction {
  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const chat = new DirectChat(this.chatId);
    const newName = (this.decryptedMessageContent.data as NameParams).name;
    const oldName = (await chat.getChatData()).name;
    // Guard against setting name when already set
    if (!newName || oldName !== DEFAULT_NAME) {
      return;
    }
    // await this.saveMessage();
    //update connection
    await updateConnectionOnNewMessage(
      {
        chatId: this.chatId,
        name: newName,
        recentMessageType: ContentType.name,
        readStatus: MessageStatus.latest,
      },
      NewMessageCountAction.unchanged,
    );
    await chat.updateName(newName || DEFAULT_NAME);
    //notify user if notifications are ON
    await this.notify(newName);
  }

  /**
   * Notify user that a new connection has been formed
   * @param name New contactname
   * @returns void
   */
  async notify(name: string) {
    const permissions = await getChatPermissions(this.chatId, ChatType.direct);
    const shouldNotify = permissions.notifications;
    if (!shouldNotify) {
      return;
    }
    displaySimpleNotification(
      'New connection',
      name || DEFAULT_NAME + ' has connected with you.',
      true,
      this.chatId,
    );
  }
}

export default ReceiveName;
