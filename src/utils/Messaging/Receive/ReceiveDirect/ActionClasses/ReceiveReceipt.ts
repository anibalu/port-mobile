import {
  ContentType,
  MessageStatus,
  ReceiptParams,
} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import DirectReceiveAction from '../DirectReceiveAction';
import {updateConnectionIfLatestMessageIsX} from '@utils/Storage/connections';

/**
 * Handles any form of silent message updates, such as read receipts and payload deliveries.
 */
export default class ReceiveReceipt extends DirectReceiveAction {
  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const receipt = this.decryptedMessageContent.data as ReceiptParams;
    // Updadte the message with the correct status
    storage.updateMessageStatus(this.chatId, {
      messageIdToBeUpdated: receipt.messageId,
      readAtTimestamp: receipt.readAt,
      deliveredAtTimestamp: receipt.deliveredAt,
      updatedMessageStatus: receipt.readAt
        ? MessageStatus.read
        : MessageStatus.delivered,
    });

    const update = {
      chatId: this.chatId,
      readStatus: receipt.readAt ? MessageStatus.read : MessageStatus.delivered,
      recentMessageType: ContentType.receipt,
    };
    // update read status on connection card after we receive
    await updateConnectionIfLatestMessageIsX(receipt.messageId, update);
  }
}
