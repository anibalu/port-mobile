import {
  ContentType,
  LineReactionSender,
  MessageStatus,
  ReactionParams,
} from '@utils/Messaging/interfaces';
import * as storage from '@utils/Storage/messages';
import * as ReactionStorage from '@utils/Storage/reactions';
import DirectReceiveAction from '../DirectReceiveAction';
import {getConnection, updateConnection} from '@utils/Connections';
import {getChatPermissions} from '@utils/ChatPermissions';
import {ChatType} from '@utils/Connections/interfaces';
import {displaySimpleNotification} from '@utils/Notifications';
import getConnectionTextByContentType from '@utils/Connections/getConnectionTextByContentType';

/**
 * Handles any form of silent message updates, such as read receipts and payload deliveries.
 */
class ReceiveReaction extends DirectReceiveAction {
  generatePreviewText(): string {
    return '';
  }
  async performAction(): Promise<void> {
    //set reaction
    await this.updateReactionInfo();
    //update connection
    const updatedText = await this.updateConnectionInfo();
    //notify only if a reaction is added.
    if (updatedText) {
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

  /**
   * Updates the reaction table of a new added or removed reaction.
   * Also sets the 'hasReaction' flag of the target message.
   */
  private async updateReactionInfo() {
    //set 'hasReaction' attibute of target message.
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const reactionData = this.decryptedMessageContent.data as ReactionParams;
    await storage.setHasReactions(this.chatId, reactionData.messageId);
    if (reactionData.tombstone) {
      ReactionStorage.deleteReaction(
        this.chatId,
        reactionData.messageId,
        LineReactionSender.self,
      );
    } else {
      await ReactionStorage.addReaction(
        this.chatId,
        reactionData.messageId,
        LineReactionSender.self,
        reactionData.reaction,
      );
    }
  }

  /**
   * Update connection with preview text and new send status.
   * Update based on whether reaction is added or removed.
   * Return text to notify if reaction is added. otherwise return null.
   */
  private async updateConnectionInfo(): Promise<string | null> {
    this.decryptedMessageContent = this.decryptedMessageContentNotNullRule();
    const reactionData = this.decryptedMessageContent.data as ReactionParams;
    //If reaction is an "un-reaction", reset connection with attributes associated with latest message.
    if (reactionData.tombstone) {
      const connection = await getConnection(this.chatId);
      const latestMessage = await storage.getMessage(
        this.chatId,
        connection.latestMessageId || '',
      );
      if (latestMessage) {
        //if latest message exists, use its attributes
        await updateConnection({
          chatId: this.chatId,
          text: getConnectionTextByContentType(
            latestMessage.contentType,
            latestMessage.data,
          ),
          recentMessageType: latestMessage.contentType,
          readStatus: latestMessage.messageStatus,
          timestamp: latestMessage.timestamp,
        });
      } else {
        //else, set connection text to empty
        await updateConnection({
          chatId: this.chatId,
          text: '',
        });
      }
    }
    //Else, update connection with reaction text.
    else {
      // Fetch the target message of the reaction
      const targetMessage = await storage.getMessage(
        reactionData.chatId,
        reactionData.messageId,
      );
      const text =
        targetMessage &&
        getConnectionTextByContentType(
          targetMessage.contentType,
          targetMessage.data,
        );
      // Construct the text to update based on the reaction
      const updatedText =
        'Reacted ' + reactionData.reaction + ' to "' + text + '"';
      //update connection
      await updateConnection({
        chatId: this.chatId,
        text: updatedText,
        recentMessageType: ContentType.reaction,
        readStatus: MessageStatus.latest,
      });
      return updatedText;
    }
    return null;
  }
}

export default ReceiveReaction;
