import DirectReceiveAction from '../DirectReceiveAction';
import {MAX_CALL_ANSWER_WINDOW_SECONDS} from '@configs/constants';
import * as storage from '@utils/Storage/messages';
import {LineMessageData} from '@utils/Storage/DBCalls/lineMessage';
import {ContentType, MessageStatus} from '@utils/Messaging/interfaces';
import {generateRandomHexId} from '@utils/IdGenerator';
import store from '@store/appStore';
import {displayIncomingCallOSUI} from '@utils/Calls/CallOSBridge';

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
    const receivedTime = new Date(this.receiveTime);
    const currentTime = new Date();

    const remainingTime =
      MAX_CALL_ANSWER_WINDOW_SECONDS -
      (currentTime.getTime() - receivedTime.getTime()) / 1000 -
      2; // deduct 2 seconds for good measure

    if (remainingTime < 1) {
      return;
    }
    // Display the incoming call OS UI
    displayIncomingCallOSUI(this.chatId, this.message.call_id, remainingTime); // Asynchronously display calling UI
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
