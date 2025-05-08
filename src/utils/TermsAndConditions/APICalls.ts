import axios from 'axios';

import {POLICY_ACCEPTANCE} from '@configs/api';

import {getToken} from '@utils/ServerAuth';

export interface TermsAndConditionParams {
  /**
   * If true, the user needs to accept the terms and conditions. 
   * This is stronger than shouldNotify as it requires the user to accept the terms and conditions.
   */
  needsToAccept: boolean; 
  /**
   * If true, the user should be notified of the terms and conditions
   */
  shouldNotify: boolean; 
}

/**
 * Fetches the terms and conditions from the server
 * @returns TermsAndConditionParams | null
 */
export async function getTermsAndConditions(): Promise<TermsAndConditionParams | null> {
  try {
    const token = await getToken();
    const response = await axios.get(POLICY_ACCEPTANCE, {
      headers: {Authorization: `${token}`},
    });
    return response.data;
  } catch {
    console.error('error: failed to fetch T&C update');
    return null;
  }
}

/**
 * Sends the updated acceptance of the terms and conditions to the server
 * @returns boolean
 */
export async function sendUpdatedAcceptance() {
  try {
    const token = await getToken();
    await axios.patch(POLICY_ACCEPTANCE, '', {
      headers: {Authorization: `${token}`},
    });
  } catch (error) {
    console.error('error', error);
    throw new Error('PolicyUpdatedAcceptanceError');
  }
}
