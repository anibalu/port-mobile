import {
  LINE_SUPERPORT_CREATION_DELETION,
  LINE_SUPERPORT_LIMIT_MODIFICATION,
  LINE_SUPERPORT_PAUSE,
  LINE_SUPERPORT_RESUME,
} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';

/**
 * Fetches a new direct superport.
 * @returns - superport Id
 */
export async function getNewDirectSuperport(limit?: number): Promise<string> {
  const token = await getToken();
  const response = await axios.post(
    LINE_SUPERPORT_CREATION_DELETION,
    {
      limit: limit,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data.NewSuperPort) {
    const superport = response.data.NewSuperPort;
    return superport;
  }
  throw new Error('APIError');
}

/**
 * Delete a superport using a superport Id.
 * @param lineSuperportId
 */
export async function deleteDirectSuperport(lineSuperportId: string) {
  const token = await getToken();
  try {
    await axios.delete(
      LINE_SUPERPORT_CREATION_DELETION + `/${lineSuperportId}`,
      {
        headers: {Authorization: `${token}`},
      },
    );
  } catch (error: any) {
    if (typeof error === 'object' && error?.response) {
      if (error.response?.status === 404) {
        return;
      }
    }
    console.log('Error deleting superport: ', error);
    throw new Error('APIError');
  }
}

/**
 * Modify usage limits of a superport
 * @param lineSuperportId - superport
 * @param limit - total connections possible
 * @param uses - total connections already made
 */
export async function modifyDirectSuperportLimits(
  lineSuperportId: string,
  limit: number,
  uses: number,
) {
  const token = await getToken();
  try {
    await axios.patch(
      LINE_SUPERPORT_LIMIT_MODIFICATION,
      {
        limit: limit,
        uses: uses,
        lineSuperportId: lineSuperportId,
      },
      {
        headers: {Authorization: `${token}`},
      },
    );
  } catch (error: any) {
    if (typeof error === 'object' && error?.response) {
      if (error.response?.status === 404) {
        return;
      }
    }
    console.log('Error modifying superport limits: ', error);
    throw new Error('APIError');
  }
}

/**
 * Fetch a superport's limits
 * @param lineSuperportId - superport
 * @returns - limit number
 */
export async function getDirectSuperportLimits(
  lineSuperportId: string,
): Promise<number> {
  const token = await getToken();
  try {
    const response = await axios.get(LINE_SUPERPORT_LIMIT_MODIFICATION, {
      params: {lineSuperportId: lineSuperportId},
      headers: {Authorization: `${token}`},
    });
    if (response.data) {
      const superportLimit = response.data;
      return superportLimit;
    }
    throw new Error('No limit returned');
  } catch (error: any) {
    if (typeof error === 'object' && error?.response) {
      if (error.response?.status === 404) {
        return 0;
      }
    }
    console.log('Error getting superport limits: ', error);
    throw new Error('APIError');
  }
}

/**
 * Pause a superport.
 * @param lineSuperportId - superport
 */
export async function pauseDirectSuperport(lineSuperportId: string) {
  const token = await getToken();
  try {
    await axios.patch(
      LINE_SUPERPORT_PAUSE,
      {
        lineSuperportId: lineSuperportId,
      },
      {
        headers: {Authorization: `${token}`},
      },
    );
  } catch (error: any) {
    if (typeof error === 'object' && error?.response) {
      if (error.response?.status === 404) {
        return;
      }
    }
    console.log('Error pausing superport: ', error);
    throw new Error('APIError');
  }
}

/**
 * resume a superport.
 * @param lineSuperportId - superport
 */
export async function resumeDirectSuperport(lineSuperportId: string) {
  const token = await getToken();
  try {
    await axios.patch(
      LINE_SUPERPORT_RESUME,
      {
        lineSuperportId: lineSuperportId,
      },
      {
        headers: {Authorization: `${token}`},
      },
    );
  } catch (error: any) {
    if (typeof error === 'object' && error?.response) {
      if (error.response?.status === 404) {
        return;
      }
    }
    console.log('Error resuming superport: ', error);
    throw new Error('APIError');
  }
}
