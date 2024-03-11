import store from '@store/appStore';
import {LineReactionSender, ReactionParams} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import DirectReceiveAction from '../DirectReceiveAction';
import {addReaction} from '@utils/Storage/reactions';

/**
 * Handles any form of silent message updates, such as read receipts and payload deliveries.
 */
class ReceiveReaction extends DirectReceiveAction {
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const reactionData = this.decryptedMessageContent.data as ReactionParams;
    console.log('Received reaction: ', reactionData);
    addReaction(
      this.chatId,
      reactionData.messageId,
      LineReactionSender.peer,
      reactionData.reaction,
    );
    storage.setHasReactions(reactionData.chatId, reactionData.messageId);
    store.dispatch({
      type: 'PING',
      payload: 'PONG',
    });
  }
}

export default ReceiveReaction;
