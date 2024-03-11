import {MessageStatus, ReceiptParams} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import DirectReceiveAction from '../DirectReceiveAction';

/**
 * Handles any form of silent message updates, such as read receipts and payload deliveries.
 */
export default class ReceiveReceipt extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const receipt = this.decryptedMessageContent.data as ReceiptParams;
    // Updadte the message with the correct status
    storage.updateMessageSendStatus(this.chatId, {
      messageIdToBeUpdated: receipt.messageId,
      readAtTimestamp: receipt.readAt,
      deliveredAtTimestamp: receipt.deliveredAt,
      updatedMessageStatus: receipt.readAt
        ? MessageStatus.read
        : MessageStatus.delivered,
    });
  }
}
