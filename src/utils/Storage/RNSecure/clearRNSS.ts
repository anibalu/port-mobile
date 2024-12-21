import EncryptedStorage from 'react-native-encrypted-storage';

/**
 * HAZMAT SUITS ON. This clears secure storage, including the user's id, keys, and tokens
 */
export async function clearRNSS() {
  await EncryptedStorage.clear();
}
