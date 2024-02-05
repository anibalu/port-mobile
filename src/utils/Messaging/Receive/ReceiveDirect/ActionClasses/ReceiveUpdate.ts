import store from '@store/appStore';
import {UpdateParams} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import {generateISOTimeStamp} from '@utils/Time';
import DirectReceiveAction from '../DirectReceiveAction';

/**
 * Handles any form of silent message updates, such as read receipts and payload deliveries.
 */
class ReceiveUpdate extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();

    //We don't save a message, we need to update the status of the message ID that needs to be updated.
    this.updateSendStatus(this.decryptedMessageContent.data as UpdateParams);
  }

  //update message send status for the given message
  async updateSendStatus(updateParams: UpdateParams) {
    //update send status

    await storage.updateMessageSendStatus(
      this.chatId,
      updateParams.messageIdToBeUpdated,
      updateParams.updatedMessageStatus,
      updateParams.deliveredAtTimestamp,
      updateParams.readAtTimestamp,
      updateParams.shouldAck,
    );
    console.log('Updating message status for ContentType.update');
    //update redux store that a new message send status has changed
    store.dispatch({
      type: 'NEW_SEND_STATUS_UPDATE',
      payload: {
        chatId: this.chatId,
        messageId: updateParams.messageIdToBeUpdated,
        messageStatus: updateParams.updatedMessageStatus,
        deliveredTimestamp: updateParams.deliveredAtTimestamp,
        readTimestamp: updateParams.readAtTimestamp,
        timestamp: generateISOTimeStamp(),
        shouldAck: updateParams.shouldAck,
      },
    });
  }
}

export default ReceiveUpdate;
