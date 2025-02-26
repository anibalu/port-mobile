import DirectReceiveAction from '../DirectReceiveAction';
import {DEFAULT_NAME, MAX_CALL_ANSWER_WINDOW_SECONDS} from '@configs/constants';
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

    const remainingTime =
      MAX_CALL_ANSWER_WINDOW_SECONDS -
      (currentTime.getTime() - receivedTime.getTime()) / 1000 -
      2; // deduct 2 seconds for good measure

    if (remainingTime < 1) {
      return;
    }
    console.log('DISPATCHING TRAP REQUEST TO INCOMING CALL SCREEN');
    store.dispatch({
      type: 'NEW_CALL',
      payload: {
        chatId: this.chatId,
        callId: this.message.call_id,
        answerWindowDuration: remainingTime,
      },
    });
  }
}

export default ReceiveCall;
