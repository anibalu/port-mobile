var SQLite = require('react-native-sqlite-storage');
SQLite.enablePromise(true);

const db_singleton_helper: any[] = [];
/**
 * Connect to our SQLite Database
 * @returns a simple db connection
 */
async function getDB() {
  if (db_singleton_helper[0]) {
    return db_singleton_helper[0];
  }
  db_singleton_helper.push(
    await SQLite.openDatabase(
      {name: 'numberless.db', location: 'default'},
      () => {
        console.log('Sucessfully opened database.');
      },
      err => {
        console.log('Failed to open database: ', err);
      },
    ),
  );
  return db_singleton_helper[0];
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
  onSuccess: Function,
) {
  const db = await getDB();
  await db.transaction(tx => {
    tx.executeSql(preparedStatement, args, onSuccess);
  });
  // db.close();
}
