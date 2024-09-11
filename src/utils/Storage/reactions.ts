import {ReactionSender} from '@utils/Messaging/interfaces';
import * as DBCalls from './DBCalls/reactions';
import {getConnection} from './connections';
import Group from '@utils/Groups/Group';
import {DEFAULT_GROUP_MEMBER_NAME, DEFAULT_NAME} from '@configs/constants';

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

export interface RichReaction extends DBCalls.reaction {
  senderName?: string;
}

export async function getRichReactions(
  chatId: string,
  messageId: string,
  line: Boolean = true,
): Promise<RichReaction[]> {
  const self_name = 'You';
  if (line) {
    const peer_name = (await getConnection(chatId))?.name || DEFAULT_NAME;
    const richReactions: RichReaction[] = await DBCalls.getAllReactions(
      chatId,
      messageId,
    );
    for (let i = 0; i < richReactions.length; i++) {
      if (ReactionSender.self === richReactions[i].senderId) {
        richReactions[i].senderName = self_name;
      }
      if (ReactionSender.peer === richReactions[i].senderId) {
        richReactions[i].senderName = peer_name;
      }
    }
    return richReactions;
  } else {
    const group = new Group(chatId);
    const richReactions: RichReaction[] = await DBCalls.getAllReactions(
      chatId,
      messageId,
    );
    for (let i = 0; i < richReactions.length; i++) {
      if (ReactionSender.self === richReactions[i].senderId) {
        richReactions[i].senderName = self_name;
      } else {
        richReactions[i].senderName =
          (await group.getMember(richReactions[i].senderId))?.name ||
          DEFAULT_GROUP_MEMBER_NAME;
      }
    }
    return richReactions;
  }
}
