import {ReactionParams} from '@utils/Messaging/interfaces';

import * as storage from '@utils/Storage/messages';
import {addReaction} from '@utils/Storage/reactions';
import GroupReceiveAction from '../GroupReceiveAction';

/**
 * Handles any form of silent message updates, such as read receipts and payload deliveries.
 */
class ReceiveReaction extends GroupReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();

    //We don't save a message, we need to update the status of the message ID that needs to be updated.
    this.saveReaction(this.decryptedMessageContent.data as ReactionParams);
  }

  //update message send status for the given message
  async saveReaction(data: ReactionParams) {
    //Determines if a message has a reaction or not

    addReaction(this.chatId, data.messageId, this.senderId, data.reaction);
    storage.setHasReactions(this.chatId, data.messageId);
  }
}

export default ReceiveReaction;
