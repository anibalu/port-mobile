import * as DBCalls from './DBCalls/blockUser';

/**
 * util for blocking a user and saving pairhash key to the db
 * @param user takes in user prop which has a name, pairhash and time
 * @returns return nothing
 */
export async function blockUser(user: DBCalls.BlockedUser) {
  //carve out for older test versions. However, this maybe unnecessary since all
  //production versions are expected to have the pairHash attribute.
  if (!user.pairHash) {
    return;
  }
  try {
    //add blocked user to storage
    await DBCalls.blockUser(user as DBCalls.BlockedUser);
  } catch (error) {
    console.log('Error adding a blocked user: ', error);
  }
}

/**
 * util for checking if a user is blocked
 * @param pairHash takes in pairhash as a prop
 * @returns a boolean based on whether the user is blocked
 */
export async function isUserBlocked(pairHash: string) {
  return await DBCalls.isUserBlocked(pairHash);
}

/**
 * util for unblocking a user
 * @param pairHash takes in pairhash as a prop to unblock a user
 * @returns nothing
 */
export async function unblockUser(pairHash: string | null) {
  if (!pairHash) {
    return;
  }
  await DBCalls.unblockUser(pairHash);
}

/**
 * util to get all blocked users
 * @returns all the blocked users
 */
export async function getAllBlockedUsers() {
  return await DBCalls.getAllBlockedUsers();
}

/**
 * gets count of blocked users
 * @returns count of blocked users
 */
export async function getCountOfBlockedUsers() {
  return await DBCalls.getCountOfBlockedUsers();
}
