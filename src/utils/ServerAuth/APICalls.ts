import {AUTH_SERVER_CHALLENGE_RESOURCE} from '@configs/api';
import axios from 'axios';
import {ServerAuthToken, SolvedAuthChallenge} from './interfaces';

/**
 * Gets an authentication challenge from the server
 * @param {string} clientId - Id assigned to the client by the server (this is non-permanent and changes frequently).
 * @throws {Error} - If it fails to get a challenge.
 * @returns {string} - authentication challenge issued.
 */
export async function getNewAuthChallenge(clientId: string): Promise<string> {
  const response = await axios.get(
    `${AUTH_SERVER_CHALLENGE_RESOURCE}/${clientId}`,
  );
  if (response.data.challenge) {
    return response.data.challenge;
  }
  throw new Error('ChallengeAPIError');
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
): Promise<ServerAuthToken> {
  const response = await axios.post(
    `${AUTH_SERVER_CHALLENGE_RESOURCE}/${clientId}`,
    solvedChallenge,
  );
  if (response.data) {
    return response.data;
  }
  throw new Error('PostSolvedAuthChallengeAPIError');
}
