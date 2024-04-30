import {runSimpleQuery} from '../DBCalls/dbCommon';
import migration002 from './migration002';
import migration003 from './migration003';
import migration004 from './migration004';
// Increment this counter everytime you add a migration.
// If this file has been modified, hopefully this counter has ticked.
// MOST_RECENT_MIGRATION_NUMBER = 003

// To run a migration, write a suitible callback and add it to the list.
// Make sure to increment the counter above to make sure we don't do weird things.
const migrations: [number, () => Promise<void>][] = [
  [2, migration002],
  [3, migration003],
  [4, migration004],
];

export default async function runMigrations() {
  await createMigrationsTable();
  console.log('created migrations table');
  for (let migration of migrations) {
    console.log('trying to run migration: ', migration[0]);
    await runMigration(migration[0], migration[1]);
  }
}

async function createMigrationsTable() {
  await runSimpleQuery(
    `
    CREATE TABLE IF NOT EXISTS migrations (
      migrationId INT PRIMARY KEY
    );
    `,
    [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

async function runMigration(id: number, callback: () => Promise<void>) {
  let hasRun;
  await runSimpleQuery(
    `
    SELECT migrationId
    FROM migrations
    WHERE migrationId = ?
    ;
    `,
    [id],

    (tx, result) => {
      if (result.rows.length > 0) {
        hasRun = true;
      } else {
        hasRun = false;
      }
    },
  );

  if (!hasRun) {
    await callback();
    console.log('Ran migration: ', id);
    await runSimpleQuery(
      'INSERT INTO migrations ( migrationId ) VALUES (?) ;',
      [id],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (tx, result) => {},
    );
  } else {
    console.log("[DB MIGRATION] Didn't need to run migration: ", id);
  }
}
