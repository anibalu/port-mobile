import {LineReactionSender} from '@utils/Messaging/interfaces';
import * as DBCalls from './DBCalls/reactions';
import {getConnection} from './connections';
import {getProfileInfo} from './profile';

/**
 * Add a reaction to a message
 * @param chatId
 * @param messageId
 * @param senderId
 * @param reaction
 */
export async function addReaction(
  chatId: string,
  messageId: string,
  senderId: string,
  reaction: string,
): Promise<void> {
  await DBCalls.addReaction(chatId, messageId, senderId, reaction);
}
/**
 * Get all reactions for a message
 * @param chatId
 * @param messageId
 * @returns Saved reactons for a message
 */
export async function getReactions(
  chatId: string,
  messageId: string,
): Promise<[] | DBCalls.messageReaction[]> {
  return await DBCalls.getReactionsForMessage(chatId, messageId);
}

/**
 * Delete a reaction to a message from a particular sender
 * @param chatId
 * @param messageId
 * @param senderId
 */
export async function deleteReaction(
  chatId: string,
  messageId: string,
  senderId: string,
) {
  await DBCalls.deleteReaction(chatId, messageId, senderId);
}

/**
 * Get reactions and their counts for a message
 * @param chatId
 * @param messageId
 * @returns Reactions and their counts for a particular message
 */
export async function getReactionCounts(
  chatId: string,
  messageId: string,
): Promise<DBCalls.reactionCount[]> {
  return DBCalls.messageReactionCounts(chatId, messageId);
}

interface richReaction {
  senderName?: string;
  reaction: string;
  senderId?: string;
}

export async function getRichReactions(
  chatId: string,
  messageId: string,
  line: Boolean = true,
): Promise<richReaction[]> {
  if (line) {
    const self_name = (await getProfileInfo())?.name;
    const peer_name = (await getConnection(chatId))?.name;
    const richReactions: richReaction[] = await DBCalls.getAllReactions(
      chatId,
      messageId,
    );
    for (let i = 0; i < richReactions.length; i++) {
      if (LineReactionSender.self === richReactions[i].senderId) {
        richReactions[i].senderName = self_name;
      }
      if (LineReactionSender.peer === richReactions[i].senderId) {
        richReactions[i].senderName = peer_name;
      }
    }
    return richReactions;
  }
  throw new Error('NotImplementedRichGroupReactions');
}
