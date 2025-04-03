import uuid from 'react-native-uuid';

/**
 * generates a 32 character random id
 * @returns 32 character random id
 */

export function generateRandomHexId(): string {
  // Generate a UUID
  const uuidv4 = uuid.v4();
  const hexUUID = uuidv4.toString().replace(/-/g, '').toLowerCase();
  return hexUUID;
}

/**
 * generates random id between 1 and 13
 * @returns random id between 1 and 13
 */
export function pickRandomAvatarId(): string {
  return (Math.floor(Math.random() * 13) + 1).toString();
}
