import {LineReactionSender, ReactionParams} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import DirectReceiveAction from '../DirectReceiveAction';
import {addReaction, deleteReaction} from '@utils/Storage/reactions';

/**
 * Handles any form of silent message updates, such as read receipts and payload deliveries.
 */
class ReceiveReaction extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const reactionData = this.decryptedMessageContent.data as ReactionParams;
    if (reactionData.tombstone) {
      deleteReaction(
        this.chatId,
        reactionData.messageId,
        LineReactionSender.peer,
      );
    } else {
      addReaction(
        this.chatId,
        reactionData.messageId,
        LineReactionSender.peer,
        reactionData.reaction,
      );
    }
    storage.setHasReactions(reactionData.chatId, reactionData.messageId);
  }
}

export default ReceiveReaction;
