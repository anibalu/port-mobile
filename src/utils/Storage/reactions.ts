import {ReactionParams} from '../Messaging/interfaces';
import * as DBCalls from './DBCalls/reactions';

/**
 * saves message to storage.
 * @param {ReactionParams} reaction - reaction to save
 */
export async function addReaction(reaction: ReactionParams): Promise<void> {
  await DBCalls.addReaction(reaction);
}
/**
 *
 * @param {string} chatId
 * @param {string} messageId
 * @returns {Promise<{SavedMessageParams|null}>} - message for the given chat and messsageId, if it exists
 */
export async function getReactions(
  chatId: string,
  messageId: string,
): Promise<[] | ReactionParams[]> {
  return await DBCalls.getReactionsForMessage(chatId, messageId);
}

export async function updateReactions(
  chatId: string,
  messageId: string,
  cryptoId: string,
  reaction: string | null,
) {
  await DBCalls.updateReactions(chatId, messageId, cryptoId, reaction);
}
