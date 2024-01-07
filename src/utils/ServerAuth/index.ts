import {signMessage} from '@utils/Crypto/ed25519';
import {TOKEN_VALIDITY_INTERVAL} from '../../configs/constants';
import store from '../../store/appStore';
import {getProfileInfo} from '../Profile';
import {ProfileInfo} from '../Profile/interfaces';
import {readAuthToken, saveAuthToken} from '../Storage/authToken';
import {connectionFsSync} from '../Synchronization';
import {checkTimeout, generateISOTimeStamp} from '../Time';
import {
  SavedServerAuthToken,
  ServerAuthToken,
  SolvedAuthChallenge,
} from './interfaces';
import * as API from './APICalls';

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
 * @param {ProfileInfo} profile - profile info of user
 * @throws {Error} - If there is an issue fetching new token
 * @returns {ServerAuthToken} - valid token issued by server
 */
async function generateNewAuthToken(
  profile: ProfileInfo,
): Promise<ServerAuthToken> {
  const challenge = await API.getNewAuthChallenge(profile.clientId);
  const encChallenge: string = await signMessage(challenge, profile.privateKey);
  const cipher: SolvedAuthChallenge = {signedChallenge: encChallenge};
  const token: ServerAuthToken = await API.postSolvedAuthChallenge(
    profile.clientId,
    cipher,
  );
  return token;
}

/**
 * Returns a valid token
 * @param {boolean} blocking - whether the function should block fs operations until completed. default = true.
 * @throws {Error} If there is an issue getting a valid token.
 * @returns {ServerAuthToken} - valid token
 */
export async function getToken(
  blocking: boolean = true,
): Promise<ServerAuthToken> {
  const synced = async () => {
    //read token from cache
    const entireState = store.getState();
    const storeToken = entireState.authToken.savedToken;
    //case1 : no token in store
    if (!storeToken.timestamp || !storeToken.token) {
      try {
        //try loading token from file
        const savedToken = await readAuthToken(false);
        if (!savedToken) {
          throw new Error('NoTokenInFile');
        }
        if (checkAuthTokenTimeout(savedToken.timestamp)) {
          //returns token and updates cache if token is found in file and is still valid.
          store.dispatch({
            type: 'NEW_TOKEN',
            payload: savedToken,
          });
          return savedToken.token;
        } else {
          //throw an error is token is not valid
          throw new Error('TokenExpired');
        }
      } catch (error) {
        //if token is not valid or if there is no token found in file:
        //try generating a new token
        const profile = await getProfileInfo(false);
        if (!profile) {
          throw new Error('NoProfileWhileGetToken');
        }
        const token = await generateNewAuthToken(profile);
        const timestamp = generateISOTimeStamp();
        const newSavedToken: SavedServerAuthToken = {timestamp, token};
        //save token to cache
        store.dispatch({
          type: 'NEW_TOKEN',
          payload: newSavedToken,
        });
        //save token to storage
        await saveAuthToken(newSavedToken, false);
        return token;
      }
    } else {
      //case2 : token found in store
      //check validity
      if (checkAuthTokenTimeout(storeToken.timestamp)) {
        //return the token
        return storeToken.token;
      } else {
        //try generating a new token
        const profile = await getProfileInfo(false);
        if (!profile) {
          throw new Error('NoProfileWhileGetToken');
        }
        const token = await generateNewAuthToken(profile);
        const timestamp = generateISOTimeStamp();
        const newSavedToken: SavedServerAuthToken = {timestamp, token};
        //save token to cache
        store.dispatch({
          type: 'NEW_TOKEN',
          payload: newSavedToken,
        });
        //save token to storage
        await saveAuthToken(newSavedToken, false);
        return token;
      }
    }
  };
  if (blocking) {
    return await connectionFsSync(synced);
  } else {
    return await synced();
  }
}
