import axios from 'axios';

import {
  AUTH_SERVER_CHALLENGE_V2_RESOURCE,
  AUTH_SERVER_SUBMIT_KEY_RESOURCE,
} from '@configs/api';

import {SavedServerAuthToken} from '@utils/Storage/RNSecure/secureTokenHandler';
import {ShortLivedKeyExpiryWithTokenExpiry} from '@utils/Storage/RNSecure/ShortLivedKeyHandler';

/**
 * Gets an authentication challenge from the server
 * @param {string} clientId - Id assigned to the client by the server (this is non-permanent and changes frequently).
 * @throws {Error} - If it fails to get a challenge.
 * @returns {string} - authentication challenge issued.
 */
export async function getNewAuthChallenge(clientId: string): Promise<string> {
  const response = await axios.get(
    `${AUTH_SERVER_CHALLENGE_V2_RESOURCE}/${clientId}`,
  );
  if (response.data.challenge) {
    return response.data.challenge;
  }
  throw new Error('ChallengeAPIError');
}

export interface SolvedAuthChallenge {
  signedChallenge: string;
}

export interface SolvedAuthChallengeWithShortLivedKey {
  signedChallenge: string; //signedChallenge (signed with primary private key)
  shortLivedKey: string; //shortLivedKey (public key of short lived key pair)
}

/**
 * Post the solved authentication challenge to the server.
 * @param {string} clientId - Id assigned to the client by the server (this is non-permanent and changes frequently).
 * @param {SolvedAuthChallenge} solvedChallenge - an object containing the solved authentication challenge.
 * @returns - response of the server to the solved challenge.
 */
export async function postSolvedAuthChallenge(
  clientId: string,
  solvedChallenge: SolvedAuthChallenge,
): Promise<SavedServerAuthToken> {
  const response = await axios.post(
    `${AUTH_SERVER_CHALLENGE_V2_RESOURCE}/${clientId}`,
    solvedChallenge,
  );
  if (response.data) {
    return response.data;
  }
  throw new Error('PostSolvedAuthChallengeAPIError');
}

/**
 * Post the solved authentication challenge along with the short lived pubkey to the server.
 * @param {string} clientId - Id assigned to the client by the server (this is non-permanent and changes frequently).
 * @param {SolvedAuthChallengeWithShortLivedKey} SolvedAuthChallengeWithSLK - an object containing the solved authentication challenge.
 * @returns {ShortLivedKeyExpiryWithTokenExpiry} - response of the server to the solved challenge.
 */
export async function postSolvedAuthChallengeWithShortLivedKey(
  clientId: string,
  SolvedAuthChallengeWithSLK: SolvedAuthChallengeWithShortLivedKey,
): Promise<ShortLivedKeyExpiryWithTokenExpiry> {
  const response = await axios.post(
    `${AUTH_SERVER_SUBMIT_KEY_RESOURCE}/${clientId}`,
    SolvedAuthChallengeWithSLK,
  );
  if (response.data) {
    return response.data;
  }
  throw new Error('postSolvedAuthChallengeWithShortLivedKeyAPIError');
}
