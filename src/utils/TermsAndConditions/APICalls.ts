import axios from 'axios';

import {POLICY_ACCEPTANCE} from '@configs/api';

import {getToken} from '@utils/ServerAuth';

export interface TermsAndConditionParams {
  needsToAccept: boolean;
  shouldNotify: boolean;
}

export async function getTermsAndConditions(): Promise<any> {
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

export async function sendUpdatedAcceptance(): Promise<boolean> {
  try {
    const token = await getToken();
    await axios.patch(POLICY_ACCEPTANCE, '', {
      headers: {Authorization: `${token}`},
    });
    return true;
  } catch (error) {
    console.error('error', error);
    throw new Error('PolicyUpdatedAcceptanceError');
  }
}
