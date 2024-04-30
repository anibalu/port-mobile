import * as DBCalls from '../Storage/DBCalls/blockUser';

interface LooseBlockedUser {
  name: string;
  pairHash: string | null;
  time: string;
}
export async function blockUser(user: LooseBlockedUser) {
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

export async function isUserBlocked(pairHash: string) {
  return await DBCalls.isUserBlocked(pairHash);
}

export async function unblockUser(pairHash: string | null) {
  if (!pairHash) {
    return;
  }
  await DBCalls.unblockUser(pairHash);
}
