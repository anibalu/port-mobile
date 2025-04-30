import {ShortLivedKey,
  readShortLivedKeyRNSS,
  saveShortLivedKeyRNSS,
} from './RNSecure/ShortLivedKeyHandler';

/**
 * saves shortLivedKey to storage.
 * @param {SavedServerAuthToken} shortLivedKey - shortLivedKey to save.
 */
export async function saveShortLivedKey(shortLivedKey: ShortLivedKey) {
  await saveShortLivedKeyRNSS(shortLivedKey);
}

/**
 * reads shortLivedKey from storage
 * @returns {Promise<ShortLivedKey | undefined>} - shortLivedKey read from storage.
 */
export async function readShortLivedKey(): Promise<ShortLivedKey | undefined> {
  return await readShortLivedKeyRNSS();
}
