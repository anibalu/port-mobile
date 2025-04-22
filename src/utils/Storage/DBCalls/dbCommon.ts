import RNFS from 'react-native-fs';

import {isIOS} from '@components/ComponentUtils';

import {APP_GROUP_IDENTIFIER} from '@configs/constants';

import {generateRandomHexId} from '@utils/IdGenerator';

const SQLite = require('react-native-sqlite-storage');

SQLite.enablePromise(true);

async function iOSMoveDBFromLegacyLocation() {
  if (!isIOS) {
    return;
  }
  try {
    const securityGroupFolder = await RNFS.pathForGroup(APP_GROUP_IDENTIFIER);
    const dbDestinationLocation = securityGroupFolder + '/numberless.db';
    const currentDBLocation =
      RNFS.LibraryDirectoryPath + '/LocalDatabase/numberless.db';
    if (await RNFS.exists(dbDestinationLocation)) {
      // The database already exists in the destination location, so we
      // Don't need to run any more cleanup
      return;
    }
    try {
      await RNFS.moveFile(currentDBLocation, dbDestinationLocation);
    } catch (e) {
      console.warn('Could not move numberless.db out of legacy location', e);
    }
    try {
      await RNFS.moveFile(
        currentDBLocation + '-shm',
        dbDestinationLocation + '-shm',
      );
    } catch (e) {
      console.warn(
        'Could not move numberless.db-shm out of legacy location',
        e,
      );
    }
    try {
      await RNFS.moveFile(
        currentDBLocation + '-wal',
        dbDestinationLocation + '-wal',
      );
    } catch (e) {
      console.warn(
        'Could not move numberless.db-wal out of legacy location',
        e,
      );
    }
  } catch (e) {
    console.warn(
      'Could not move database out of the legacy location. This may be because it has already been moved.',
      e,
    );
  }
}

// A list to store available connections to our database
export const dbSingletonHelper: any[] = [];
/**
 * Connect to our SQLite Database
 * @returns a simple db connection. returns null if there's an error opening a db.
 */
async function getDB() {
  if (dbSingletonHelper[0]) {
    return dbSingletonHelper[0];
  }
  // Potentially move the database from the legacy location to the new
  // location within the iOS app security group location
  await iOSMoveDBFromLegacyLocation();

  try {
    const db = await SQLite.openDatabase(
      {
        name: 'numberless.db',
        location: 'Shared',
      },
      () => console.log('Successfully opened database.'),
      (err: any) => console.log('Failed to open database:', err),
    );
    dbSingletonHelper.push(db);
    return db;
  } catch (error) {
    return null;
  }
}

/**
 * Run a simple database query
 * @param preparedStatement The prepared statement to run
 * @param args Arguements into the prepared statement
 * @param onSuccess callback function to run on success
 */
export async function runSimpleQuery(
  preparedStatement: string,
  args: Array<any>,
  onSuccess: (tx: any, results: any) => void,
) {
  const db = await getDB();
  if (db) {
    try {
      await db.transaction((tx: any) => {
        tx.executeSql(preparedStatement, args, onSuccess);
      });
    } catch (error) {
      console.log('Error in running query: ', error);
    }
  }
}

export async function snapshotDatabase(): Promise<string> {
  const destination =
    RNFS.CachesDirectoryPath + `/${generateRandomHexId()}-snapshot.db`;
  const db = await getDB();
  const promise = new Promise<string>((resolve, reject) => {
    db.executeSql(
      `VACUUM main INTO ?`,
      [destination],
      () => resolve(destination),
      (err: any) => reject(err.message),
    );
  });
  return promise;
}

/**
 * Delete the database and run the migrations again
 * @param runMigrations - the migrations to run
 */
export function deleteDatabase(runMigrations: () => Promise<void>) {
  dbSingletonHelper.pop();
  SQLite.deleteDatabase(
    {
      name: 'numberless.db',
      location: 'Shared',
    },
    runMigrations,
    (err: any) => console.log('Failed to delete database:', err),
  );
}

/**
 * Database returns 1 or 0 for false or true. This needs to be converted to ts boolean types.
 * @param a - value returned by db
 * @returns - ts boolean value
 */
export function toBool(a: number | boolean | null | undefined): boolean {
  if (a) {
    return true;
  } else {
    return false;
  }
}

/**
 * To return null values as a number
 * @param a - number or null value
 * @returns - a number
 */
export function toNumber(a: number | null): number {
  if (!a) {
    return 0;
  }
  return a;
}
