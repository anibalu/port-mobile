import DirectReceiveAction from '../DirectReceiveAction';
import {DEFAULT_NAME} from '@configs/constants';
import {displaySimpleNotification} from '@utils/Notifications';
import DirectChat from '@utils/DirectChats/DirectChat';
import * as storage from '@utils/Storage/messages';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';
import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';
import {generateRandomHexId} from '@utils/IdGenerator';
import store from '@store/appStore';

class ReceiveCall extends DirectReceiveAction {
  generatePreviewText(): string {
    return '';
  }

  async performAction(): Promise<void> {
    await this.saveMessage();
    //notify user if notifications are ON
    await this.notify();
  }

  async saveMessage() {
    const savedMessage: LineMessageData = {
      chatId: this.chatId,
      messageId: generateRandomHexId(),
      data: {
        receiver: true,
        startTime: this.receiveTime,
      },
      contentType: ContentType.call,
      timestamp: this.receiveTime,
      sender: false,
      messageStatus: MessageStatus.delivered,
    };
    await storage.saveMessage(savedMessage);
  }

  /**
   * Notify user that a new connection has been formed
   * @param name New contactname
   * @returns void
   */
  async notify() {
    try {
      const chat = new DirectChat(this.chatId);
      const chatData = await chat.getChatData();
      displaySimpleNotification(
        'Incoming call...',
        chatData.name || DEFAULT_NAME + ' is trying to call you.',
        true,
        this.chatId,
      );
    } catch (error) {
      console.log('Error in displaying call notification: ', error);
    }

    const receivedTime = new Date(this.receiveTime);
    const currentTime = new Date();

    if ((currentTime - receivedTime) / 1000 > 15) {
      // if time between received time and current time is
      // more than 15 seconds, return early
      return;
    }
    console.log('DISPATCHING TRAP REQUEST TO INCOMING CALL SCREEN');
    store.dispatch({
      type: 'NEW_CALL',
      payload: {chatId: this.chatId, callId: this.message.call_id},
    });
  }
}

export default ReceiveCall;
