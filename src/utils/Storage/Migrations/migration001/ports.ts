import {runSimpleQuery} from '@utils/Storage/DBCalls/dbCommon';

/**
 * Set up ports
 * - Create the tables:
 *  - myPorts
 *  - groupPorts
 *  - readPorts
 *  - superPorts
 */
export default async function ports() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS myPorts (
      portId CHAR(32) PRIMARY KEY,
      version VARCHAR(16),
      label VARCHAR(64),
      usedOnTimestamp VARCHAR(27),
      expiryTimestamp VARCHAR(27),
      channel VARCHAR(128),
      cryptoId CHAR(32),
      permissionPresetId CHAR(32)
    ) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the myPorts table');
    },
  );

  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS groupPorts (
      portId CHAR(32) PRIMARY KEY,
      version VARCHAR(16),
      groupId CHAR(32),
      usedOnTimestamp VARCHAR(27),
      expiryTimestamp VARCHAR(27),
      channel VARCHAR(64)
    ) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the groupPorts table');
    },
  );

  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS readPorts (
      portId CHAR(32) PRIMARY KEY,
      version VARCHAR(16),
      target INT,
      name VARCHAR(64),
      description VARCHAR(256),
      usedOnTimestamp VARCHAR(27),
      expiryTimestamp VARCHAR(27),
      channel VARCHAR(128),
      cryptoId CHAR(32),
      permissionPresetId CHAR(32)
    ) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the readPorts table');
    },
  );
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS superPorts (
      portId CHAR(32) PRIMARY KEY,
      version VARCHAR(16),
      label VARCHAR(64),
      usedOnTimestamp VARCHAR(27),
      createdOnTimestamp VARCHAR(27),
      channel VARCHAR(64),
      cryptoId CHAR(32),
      connectionsPossible INT UNSIGNED
    ) ;
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, results) => {
      console.log('[DB MIGRATION] Successfully added the superPorts table');
    },
  );
}
