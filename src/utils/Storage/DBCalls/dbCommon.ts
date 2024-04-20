var SQLite = require('react-native-sqlite-storage');
SQLite.enablePromise(true);

const dbSingletonHelper: any[] = [];
/**
 * Connect to our SQLite Database
 * @returns a simple db connection. returns null if there's an error opening a db.
 */
async function getDB() {
  if (dbSingletonHelper[0]) {
    return dbSingletonHelper[0];
  }
  try {
    const db = await SQLite.openDatabase(
      {
        name: 'numberless.db',
        location: 'default',
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
