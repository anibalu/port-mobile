import {SavedServerAuthToken,
  getTokenInfoRNSS,
  saveTokenInfoRNSS,
} from './RNSecure/secureTokenHandler';

/**
 * saves server auth token to storage.
 * @param {SavedServerAuthToken} savedToken - server auth token to save.
 */
export async function saveAuthToken(savedToken: SavedServerAuthToken) {
  await saveTokenInfoRNSS(savedToken);
}

/**
 * reads server auth token from storage
 * @returns {Promise<SavedServerAuthToken | undefined>} - server auth token read from storage.
 */
export async function readAuthToken(): Promise<
  SavedServerAuthToken | undefined
> {
  return await getTokenInfoRNSS();
}
