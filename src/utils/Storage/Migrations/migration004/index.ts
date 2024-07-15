import blockedUsers from './blockUser';
import {linePairHash} from './linePairHash';

export default async function migration004() {
  await blockedUsers();
  await linePairHash();
}
