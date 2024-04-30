import {runSimpleQuery} from './dbCommon';

export interface BlockedUser {
  name: string;
  pairHash: string;
  time: string;
}

export async function blockUser(user: BlockedUser) {
  await runSimpleQuery(
    `
    INSERT INTO blockedUsers (
      pairHash, name, blockTimestamp
    ) VALUES (?,?,?);`,
    [user.pairHash, user.name, user.time],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}

export async function getAllBlockedUsers(): Promise<BlockedUser[]> {
  const blockedUsers: BlockedUser[] = [];
  await runSimpleQuery(
    `SELECT * FROM blockedUsers
    ORDER BY blockTimestamp DESC;`,
    [],
    (tx, results) => {
      const len = results.rows.length;
      for (let i = 0; i < len; i++) {
        blockedUsers.push(results.rows.item(i));
      }
    },
  );
  return blockedUsers;
}

export async function isUserBlocked(pairHash: string): Promise<boolean> {
  let blockedUser = false;
  await runSimpleQuery(
    `
    SELECT * FROM blockedUsers
    WHERE pairHash = ?;
    `,
    [pairHash],
    (tx, results) => {
      const len = results.rows.length;
      if (len > 0) {
        blockedUser = true;
      }
    },
  );
  return blockedUser;
}

export async function unblockUser(pairHash: string) {
  await runSimpleQuery(
    `
    DELETE FROM blockedUsers
    WHERE pairHash = ?;
    `,
    [pairHash],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (tx, result) => {},
  );
}
