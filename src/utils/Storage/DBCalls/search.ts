import { runSimpleQuery } from './dbCommon';

/**
 * Search for a message by a key(word)
 * @param key The message to save
 */
export async function searchMessages(key: string, limit: number = 100):Promise<Array<any>> {
    const searchResults:Array<any> = [];
    await runSimpleQuery(
      `
      SELECT messageId, chatId, data
      FROM lineMessages
      WHERE json_extract(data, '$.text')
      LIKE ? 
      ORDER BY "timestamp" DESC
      LIMIT ?;
      `,
      [`%${key}%`, limit],
      (tx, res) => {
        const len = res.rows.length;
        for (let i = 0; i < len; i++) {
          searchResults.push(res.rows.item(i));
        }
        console.log(searchResults);
      }
    );
    return searchResults;
  }