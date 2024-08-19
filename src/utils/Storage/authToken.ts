import {SavedServerAuthToken} from './RNSecure/secureTokenHandler';
import {
  getTokenInfoRNSS,
  saveTokenInfoRNSS,
} from './RNSecure/secureTokenHandler';

/**
 * saves server auth token to storage.
 * @param {SavedServerAuthToken} savedToken - server auth token to save.
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 */
export async function saveAuthToken(
  savedToken: SavedServerAuthToken,
  blocking: boolean = false,
) {
  await saveTokenInfoRNSS(savedToken, blocking);
}

/**
 * reads server auth token from storage
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = false.
 * @returns {Promise<SavedServerAuthToken | undefined>} - server auth token read from storage.
 */
export async function readAuthToken(
  blocking: boolean = false,
): Promise<SavedServerAuthToken | undefined> {
  return await getTokenInfoRNSS(blocking);
}
