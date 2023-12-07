import uuid from 'react-native-uuid';

export function generateRandomHexId(): string {
  // Generate a UUID
  const uuidv4 = uuid.v4();
  const hexUUID = uuidv4.toString().replace(/-/g, '');
  return hexUUID;
}
