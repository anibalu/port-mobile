import {DEFAULT_NAME} from '@configs/constants';

import {generateRandomHexId} from '@utils/IdGenerator';
import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * This creates an additional columns routingId in connections table
 */
export async function addRoutingIdToConnectionsTable() {
  await runSimpleQuery(
    `
        ALTER TABLE connections
        ADD COLUMN routingId CHAR(32) NOT NULL DEFAULT '00000000000000000000000000000000';
        `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added column routingId to connections',
      );
    },
  );
}

/**
 * This creates an additional column pairHash in connections table
 */
export async function addPairHashToConnectionsTable() {
  await runSimpleQuery(
    `
        ALTER TABLE connections
        ADD COLUMN pairHash CHAR(64);
        `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully added column pairHash to connections',
      );
    },
  );
}

/**
 * This sets the additional column values in the connections table
 */
export async function setupRoutingIdAndPairHashValues() {
  await runSimpleQuery(
    `
        UPDATE 
            connections
        SET 
            pairHash = (SELECT lines.pairHash FROM lines WHERE lines.lineId = connections.chatId),
            routingId = connections.chatId
        WHERE 
            EXISTS (SELECT 1 FROM lines WHERE lines.lineId = connections.chatId);

        `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log(
        '[DB MIGRATION] Successfully updated column routingId in connections',
      );
    },
  );
}

async function findConnectionsWithPairHashNull() {
  const matches: any = [];
  await runSimpleQuery(
    `
        SELECT *
        FROM connections
        WHERE pairHash IS NULL;
        `,
    [],

    (tx, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        matches.push(results.rows.item(i));
      }
    },
  );
  return matches;
}

async function getLineInfo(lineId: string) {
  let match: any = null;
  await runSimpleQuery(
    `
    SELECT *
    FROM lines
    WHERE lineId = ? ;
    `,
    [lineId],
    (tx, results) => {
      if (results.rows.length > 0) {
        const newMatch = results.rows.item(0);
        match = newMatch;
      }
    },
  );
  return match;
}

export async function addPseudoPairHashEntries() {
  const matches = await findConnectionsWithPairHashNull();
  for (let index = 0; index < matches.length; index++) {
    const pairHashId = generateRandomHexId() + generateRandomHexId();
    const name = matches[index].name || DEFAULT_NAME;
    const chatId = matches[index].chatId;
    const ExistinglineInfo = await getLineInfo(matches[index].routingId);
    const connectedOn = ExistinglineInfo ? ExistinglineInfo.connectedOn : null;
    console.log(
      'adding entries with null pairHash: ',
      pairHashId,
      name,
      connectedOn,
      chatId,
    );
    await runSimpleQuery(
      `
          INSERT INTO contacts (
            pairHash,
            name,
            connectedOn
          ) VALUES (?,?,?);
           `,
      [pairHashId, name, connectedOn],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (tx, result) => {
        console.log(
          '[DB MIGRATION] Successfully added psuedo contact entries if necessary',
        );
      },
    );
    await runSimpleQuery(
      `
          UPDATE connections
          SET pairHash = ?
          WHERE chatId = ?;
           `,
      [pairHashId, chatId],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (tx, result) => {
        console.log(
          '[DB MIGRATION] Successfully updated connection with psuedo contact entries if necessary',
        );
      },
    );
  }
}
