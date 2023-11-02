import axios from 'axios';
import {TOKEN_VALIDITY_INTERVAL} from '../../configs/constants';
import {AUTH_SERVER_CHALLENGE_RESOURCE} from '../../configs/api';
import {
  SavedServerAuthToken,
  ServerAuthToken,
  SolvedAuthChallenge,
} from './interfaces';
import {ProfileInfo} from '../Profile/interfaces';
import {symmetricEncrypt} from '@numberless/react-native-numberless-crypto';
import store from '../../store/appStore';
import {readAuthToken, saveAuthToken} from '../Storage/authToken';
import {generateISOTimeStamp} from '../Time';
import {connectionFsSync} from '../Synchronization';
import {getProfileInfo} from '../Profile';

/**
 * Steps to authenticate oneself to the server:
 * 1. make sure client's public key is posted to server
 * 2. make sure client has received server's public key.
 * 3. make sure client has generated a shared secret using user's private key and server's public key
 * 4. Request authentication challenge string
 * 5. Encrypt authentication challenge string using shared secret and with it send over associated data and nonce to server.
 * 6. Server verifies the encrypted string by checking if it decrypts to the correct encryption challenge.
 * 7. If verification succeeds, server issues an authentication token valid for a small interval. After this, another token needs to be requested using the above steps.
 */

/**
 * Checks if a server auth token is still valid.
 * @param {string} timestamp - timestamp of when the token was created
 * @param {number} acceptedDuration - how long the server auth token is valid
 * @returns {boolean} - true if token is still valid
 */
function checkAuthTokenTimeout(
  timestamp: string,
  acceptedDuration: number = TOKEN_VALIDITY_INTERVAL,
): boolean {
  const timeStamp: Date = new Date(timestamp);
  const now: Date = new Date();
  const timeDiff = now.getTime() - timeStamp.getTime();
  if (timeDiff <= acceptedDuration) {
    return true;
  } else {
    return false;
  }
}

/**
 * Gets an authentication challenge from the server
 * @param {string} clientId - Id assigned to the client by the server (this is non-permanent and changes frequently).
 * @throws {Error} - If it fails to get a challenge.
 * @returns {string} - authentication challenge issued.
 */
async function getNewAuthChallenge(clientId: string) {
  const response = await axios.get(
    `${AUTH_SERVER_CHALLENGE_RESOURCE}/${clientId}`,
  );
  return response.data;
}

/**
 * Post the solved authentication challenge to the server.
 * @param {string} clientId - Id assigned to the client by the server (this is non-permanent and changes frequently).
 * @param {SolvedAuthChallenge} solvedChallenge - an object containing the solved authentication challenge.
 * @returns - response of the server to the solved challenge.
 */
async function postSolvedAuthChallenge(
  clientId: string,
  solvedChallenge: SolvedAuthChallenge,
) {
  const response = await axios.post(
    `${AUTH_SERVER_CHALLENGE_RESOURCE}/${clientId}`,
    solvedChallenge,
  );
  return response.data;
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
  const challenge = await getNewAuthChallenge(profile.clientId);
  const encChallenge: string = await symmetricEncrypt(
    profile.sharedSecret,
    challenge.challenge,
    profile.clientId,
  );
  const cipher: SolvedAuthChallenge = JSON.parse(encChallenge);
  const token: ServerAuthToken = await postSolvedAuthChallenge(
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
    const cachedToken = entireState.authToken.savedToken;
    if (cachedToken.timestamp === undefined) {
      //token is in initial state, so load token from file
      try {
        const savedToken = await readAuthToken(false);
        if (checkAuthTokenTimeout(savedToken.timestamp)) {
          //returns token and updates cache if token is found in file and is still valid.
          store.dispatch({
            type: 'NEW_TOKEN',
            payload: savedToken,
          });
          return savedToken.token;
        } else {
          //throw an error is token is not valid
          throw new Error('TokenNotValid');
        }
      } catch (error) {
        //if token is not valid or if there is no token found in file:
        //try generating a new token
        const profile: ProfileInfo = await getProfileInfo(false);
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
      //if token found in cache:
      //check validity
      if (checkAuthTokenTimeout(cachedToken.timestamp)) {
        //return the token
        return cachedToken.token;
      } else {
        //try generating a new token
        const profile: ProfileInfo = await getProfileInfo(false);
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
