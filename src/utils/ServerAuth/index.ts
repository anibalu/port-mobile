import {signMessage} from '@utils/Crypto/ed25519';
import {
  SavedServerAuthToken,
  ServerAuthToken,
} from '@utils/Storage/RNSecure/secureTokenHandler';

import {TOKEN_VALIDITY_INTERVAL} from '../../configs/constants';
import {getProfileInfo} from '../Profile';
import {readAuthToken, saveAuthToken} from '../Storage/authToken';
import {connectionFsSync} from '../Synchronization';
import {checkTimeout, generateISOTimeStamp} from '../Time';

import * as API from './APICalls';

// global object to cache auth token so that it doesn't have to be repeatedly read from storage.
let cachedToken: SavedServerAuthToken | undefined;

/**
 * Steps to authenticate oneself to the server:
 * 1. make sure client's public key is posted to server
 * 2. Request authentication challenge string
 * 3. sign authentication challenge string using private key
 * 4. Server verifies the signed challenge.
 * 5. If verification succeeds, server issues an authentication token valid for a small interval. After this, another token needs to be requested using the above steps.
 */

/**
 * Checks if a server auth token is still valid.
 * @param {string} timestamp - timestamp of when the token was created
 * @param {number} acceptedDuration - how long the server auth token is valid
 * @returns {boolean} - true if token is still valid
 */
function checkAuthTokenTimeout(
  timestamp: string | null | undefined,
  acceptedDuration: number = TOKEN_VALIDITY_INTERVAL,
): boolean {
  return checkTimeout(timestamp, acceptedDuration);
}

/**
 * Generates new auth token by posting solved authentication challenge.
 * @throws {Error} - If there is an issue fetching new token
 * @returns {ServerAuthToken} - valid token
 */
async function generateAndSaveNewAuthToken(): Promise<ServerAuthToken> {
  const profile = await getProfileInfo();
  if (!profile) {
    throw new Error('NoProfileWhileGetToken');
  }
  const challenge = await API.getNewAuthChallenge(profile.clientId);
  const encChallenge: string = await signMessage(challenge, profile.privateKey);
  const token: ServerAuthToken = await API.postSolvedAuthChallenge(
    profile.clientId,
    {signedChallenge: encChallenge},
  );
  const timestamp = generateISOTimeStamp();
  const newSavedToken: SavedServerAuthToken = {timestamp, token};
  //save token to cache
  cachedToken = newSavedToken;
  //save token to storage
  await saveAuthToken(cachedToken);
  return token;
}

/**
 * Returns a valid token
 * @throws {Error} If there is an issue getting a valid token.
 * @returns {ServerAuthToken} - valid token
 */
export async function getToken(): Promise<ServerAuthToken> {
  const synced = async () => {
    //case1 : no token is cached
    if (!cachedToken || !cachedToken.timestamp || !cachedToken.token) {
      try {
        //try loading token from file
        const savedToken = await readAuthToken();
        if (!savedToken) {
          throw new Error('NoTokenInFile');
        }
        if (checkAuthTokenTimeout(savedToken.timestamp)) {
          //returns token and updates cache if token is found in file and is still valid.
          cachedToken = savedToken;
          return cachedToken.token;
        } else {
          //throw an error is token is not valid
          throw new Error('TokenExpired');
        }
      } catch (error) {
        //if token is not valid or if there is no token found in file:
        //try generating a new token
        return await generateAndSaveNewAuthToken();
      }
    } else {
      //case2 : token found in store
      //check validity
      if (checkAuthTokenTimeout(cachedToken.timestamp)) {
        //return the token
        return cachedToken.token;
      } else {
        //try generating a new token
        return await generateAndSaveNewAuthToken();
      }
    }
  };
  return await connectionFsSync(synced);
}
