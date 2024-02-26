import store from '@store/appStore';
import {ReactionParams} from '@utils/Messaging/interfaces';

import * as storage from '@utils/Storage/messages';
import {
  addReaction,
  getReactions,
  updateReactions,
} from '@utils/Storage/reactions';
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
    let reactionState = true;

    if (data.reaction === null) {
      const reactions = await getReactions(data.chatId, data.messageId);
      if (reactions?.length <= 1) {
        reactionState = false;
      } else {
        reactionState = true;
      }
    }

    const oldReactions = await getReactions(data.chatId, data.messageId);

    const hasUserReacted = oldReactions.some(
      item => item.cryptoId === data.cryptoId,
    );

    if (hasUserReacted) {
      //Adding reaction to the reaction DB.
      await updateReactions(
        data.chatId,
        data.messageId,
        data.cryptoId,
        data.reaction,
      );
    } else {
      await addReaction(data);
    }

    //Reactions can be changed, added or removed.
    await storage.updateGroupReaction(
      data.chatId,
      data.messageId,
      reactionState,
    );

    store.dispatch({
      type: 'REACTION_UPDATE',
      payload: {
        chatId: data.chatId,
        messageId: data.messageId,
        hasReaction: reactionState,
        latestReaction: data.reaction,
      },
    });
  }
}

export default ReceiveReaction;
