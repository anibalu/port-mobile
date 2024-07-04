import {
  LineReactionSender,
  MessageStatus,
  ReactionParams,
} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import DirectReceiveAction from '../DirectReceiveAction';
import {addReaction, deleteReaction} from '@utils/Storage/reactions';
import {
  getConnection,
  updateConnection,
  updateConnectionOnNewMessage,
} from '@utils/Connections';
import {getChatPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Connections/interfaces';
import {displaySimpleNotification} from '@utils/Notifications';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';
import {NewMessageCountAction} from '@utils/Storage/DBCalls/connections';

/**
 * Handles any form of silent message updates, such as read receipts and payload deliveries.
 */
class ReceiveReaction extends DirectReceiveAction {
  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const reactionData = this.decryptedMessageContent.data as ReactionParams;

    const currMessage = await storage.getMessage(
      reactionData.chatId,
      reactionData.messageId,
    );
    //if message does not exist, no point in processing message.
    if (!currMessage) {
      return;
    }

    const text = getConnectionTextByContentType(
      currMessage.contentType,
      currMessage.data,
    );

    let updatedText = `${
      reactionData.reaction !== ''
        ? 'Reacted ' + reactionData.reaction + ' to "' + text + '"'
        : ''
    }`;

    //if the reaction type is a removed reaction.
    if (reactionData.tombstone) {
      deleteReaction(
        this.chatId,
        reactionData.messageId,
        LineReactionSender.peer,
      );
      const connection = await getConnection(this.chatId);
      const latestMessage = await storage.getMessage(
        this.chatId,
        connection.latestMessageId || '',
      );
      //if latest message does not exit, no point in updating the connection
      if (latestMessage) {
        //on unreacting, the chattile needs to show the latest non-reaction message.
        //since the latestMessageId field always contains non-reaction messages,
        //we can restore the connection tile based on its message contents.
        const restoredText = getConnectionTextByContentType(
          latestMessage.contentType,
          latestMessage.data,
        );
        await updateConnection({
          chatId: this.chatId,
          text: restoredText,
          readStatus: latestMessage.messageStatus,
          recentMessageType: latestMessage.contentType,
          timestamp: latestMessage.timestamp,
        });
      }
    }
    //if the reaction type is an added reaction.
    else {
      addReaction(
        this.chatId,
        reactionData.messageId,
        LineReactionSender.peer,
        reactionData.reaction,
      );
      storage.setHasReactions(reactionData.chatId, reactionData.messageId);
      //update connection and promote to the top
      await updateConnectionOnNewMessage(
        {
          chatId: this.chatId,
          text: updatedText,
          readStatus: MessageStatus.latest,
          recentMessageType: this.decryptedMessageContent.contentType,
        },
        NewMessageCountAction.unchanged,
      );
      //notify user if notifications are ON
      const permissions = await getChatPermissions(
        this.chatId,
        ChatType.direct,
      );
      await this.notify(permissions.notifications, updatedText);
    }
  }

  async notify(shouldNotify: boolean, updatedText: string) {
    if (shouldNotify) {
      this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
      const connection = await getConnection(this.chatId);
      const notificationData = {
        title: connection.name,
        body: updatedText || '',
      };
      displaySimpleNotification(
        notificationData.title,
        notificationData.body,
        !connection.disconnected,
        this.chatId,
      );
    }
  }
}

export default ReceiveReaction;
