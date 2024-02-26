import {ReactionParams} from '@utils/Messaging/interfaces';
import {runSimpleQuery} from './dbCommon';

export async function addReaction(reactions: ReactionParams) {
  await runSimpleQuery(
    `
    INSERT INTO reactions (
        chatId ,
        messageId ,
        cryptoId,
        reaction 
    ) VALUES (?, ?, ?, ?) ;
    `,
    [
      reactions.chatId,
      reactions.messageId,
      reactions.cryptoId,
      reactions.reaction,
    ],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}

export async function updateReactions(
  chatId: string,
  messageId: string,
  cryptoId: string,
  reaction: string | null,
) {
  await runSimpleQuery(
    `
    UPDATE reactions
    SET reaction = ?
    WHERE chatId = ? AND messageId = ? and cryptoId = ? ;
    `,
    [reaction, chatId, messageId, cryptoId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}

/**
 * Get a message
 * @param chatId The chat id of the message you seek
 * @param messageId the message id of the message you seek
 * @returns the message you seek, if it exists
 */
export async function getReactionsForMessage(
  chatId: string,
  messageId: string,
): Promise<[] | ReactionParams[]> {
  let entry = null;
  let reactions: ReactionParams[] = [];
  await runSimpleQuery(
    `
    SELECT * FROM reactions
    WHERE chatId = ? and messageId = ? ;
    `,
    [chatId, messageId],
    (tx, results) => {
      if (results.rows.length) {
        for (let i = 0; i < results.rows.length; i++) {
          entry = results.rows.item(i);
          reactions.push(entry);
        }
      }
    },
  );
  return reactions;
}
