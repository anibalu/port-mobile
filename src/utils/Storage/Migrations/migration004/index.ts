import blockedUsers from './blockUser';

export default async function migration004() {
  await blockedUsers();
}
