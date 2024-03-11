import {runSimpleQuery} from './dbCommon';

/**
 * Save a reaction. If the reaction already exists, update it
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
) {
  let needToUpdate = true;
  await runSimpleQuery(
    `
    INSERT INTO reactions (
        chatId ,
        messageId ,
        senderId,
        reaction 
    ) VALUES (?, ?, ?, ?) ;
    `,
    [chatId, messageId, senderId, reaction],
    (tx, res) => {
      console.log(res);
      if (res.rowsAffected > 0) {
        needToUpdate = false;
      }
    },
  );
  // Potentially failed due to violation on unique constraint
  // Retry as an update
  if (needToUpdate) {
    await updateReactions(chatId, messageId, senderId, reaction);
  }
}

/**
 * Update an existing reaction
 * @param chatId
 * @param messageId
 * @param senderId
 * @param reaction
 */
async function updateReactions(
  chatId: string,
  messageId: string,
  senderId: string,
  reaction: string | null,
) {
  await runSimpleQuery(
    `
    UPDATE reactions
    SET reaction = ?
    WHERE chatId = ? AND messageId = ? and senderId = ? ;
    `,
    [reaction, chatId, messageId, senderId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, res) => {},
  );
}

export interface messageReaction {
  senderId: string;
  reaction: string;
}

/**
 * Get all reactions associated with a message
 * @param chatId The chat id of the message you seek
 * @param messageId the message id of the message you seek
 * @returns the message you seek, if it exists
 */
export async function getReactionsForMessage(
  chatId: string,
  messageId: string,
): Promise<[] | messageReaction[]> {
  let reactions: messageReaction[] = [];
  await runSimpleQuery(
    `
    SELECT senderId, reaction
    FROM reactions
    WHERE chatId = ? and messageId = ? ;
    `,
    [chatId, messageId],
    (tx, results) => {
      let entry = null;
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

export interface reactionCount {
  reaction: string;
  count: number;
}
/**
 * Get the reaction counts for a message
 * @param chatId
 * @param messageId
 * @returns A list of reaactions and their counts
 */
export async function messageReactionCounts(
  chatId: string,
  messageId: string,
): Promise<reactionCount[]> {
  const reactions: reactionCount[] = [];
  await runSimpleQuery(
    `
    SELECT reaction, COUNT(reaction) as count
    FROM reactions
    WHERE chatId = ? and messageId = ? 
    GROUP BY reaction;
    `,
    [chatId, messageId],
    (tx, results) => {
      let entry;
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

interface reaction {
  senderId: string;
  reaction: string;
}

export async function getAllReactions(
  chatId: string,
  messageId: string,
): Promise<reaction[]> {
  const reactions: reaction[] = [];
  await runSimpleQuery(
    `
    SELECT *
    FROM reactions
    WHERE chatId = ? and messageId = ? ;
    `,
    [chatId, messageId],
    (tx, results) => {
      let entry;
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
