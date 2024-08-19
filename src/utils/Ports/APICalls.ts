import {
  BUNDLE_MANAGEMENT_RESOURCE,
  CONTACT_SHARING_MANAGEMENT_RESOURCE,
  CONTACT_SHARING_PAUSE,
  CONTACT_SHARING_RESUME,
  CONTACT_SHARING_TICKET_MANAGEMENT,
  GROUP_LINKS_MANAGEMENT_RESOURCE,
  LINE_LINKS_MANAGEMENT_RESOURCE,
  LINE_SUPERPORT_BULK_UPDATE,
  LINE_SUPERPORT_CREATION_DELETION,
  LINE_SUPERPORT_LIMIT_MODIFICATION,
  LINE_SUPERPORT_PAUSE,
  LINE_SUPERPORT_RESUME,
} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';

/**
 * fetches new unused Ports
 * @returns - list of port Ids
 */
export async function getNewPorts(): Promise<string[]> {
  const token = await getToken();
  const response = await axios.post(LINE_LINKS_MANAGEMENT_RESOURCE, null, {
    headers: {Authorization: `${token}`},
  });
  const portIds: string[] = response.data;
  return portIds;
}

/**
 * upload a bundle string and get the associated bundle Id of the upload
 * @param bundleString - string being uploaded.
 * @param persistent - whether bundle can be used multiple times. default is false
 * @returns - bundle Id
 */
export async function getBundleId(
  bundleString: string,
  persistent: boolean = false,
): Promise<string> {
  const token = await getToken();
  const response = await axios.post(
    BUNDLE_MANAGEMENT_RESOURCE,
    {
      bundle: bundleString,
      persistent: persistent,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data.bundleId) {
    const bundleId: string = response.data.bundleId;
    return bundleId;
  }
  throw new Error('APIError');
}

/**
 * Fetches new unused group ports for a group
 * @param groupId - Id of the group
 * @returns - array of Port Ids
 */
export async function getNewGroupPorts(groupId: string): Promise<string[]> {
  const token = await getToken();
  //add group links management resource
  const response = await axios.post(
    GROUP_LINKS_MANAGEMENT_RESOURCE,
    {
      groupId: groupId,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data) {
    const connectionLinks: string[] = response.data;
    return connectionLinks;
  }
  throw new Error('APIError');
}

/**
 * Superport API calls
 */

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

interface BulkUpdateSuperport {
  id: string;
  limit: number;
  uses: number;
}

/**
 * bulk update the limits of superports.
 * @param lineSuperportId - superport
 */
export async function bulkUpdateDirectSuperports(
  superports: BulkUpdateSuperport[],
) {
  const token = await getToken();
  try {
    await axios.post(
      LINE_SUPERPORT_BULK_UPDATE,
      {
        superports: superports,
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
    console.log('Error bulk updating superports: ', error);
    throw new Error('APIError');
  }
}

/**
 * Contact port API calls
 */

/**
 * Create a contact port
 * @param lineId - line for which the contact port is being created
 * @param active - whether you want the contact port to be active
 * @returns - contact port
 */
export async function getNewContactPort(
  lineId: string,
  active: boolean,
): Promise<string> {
  const token = await getToken();
  const response = await axios.post(
    CONTACT_SHARING_MANAGEMENT_RESOURCE,
    {
      lineId: lineId,
      active: active,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data?.newContactPort) {
    const contactPort = response.data.newContactPort;
    return contactPort;
  }
  throw new Error('APIError');
}

/**
 * Create a valid ticket for a contact port
 * @param contactPort
 * @param ticket - valid ticket
 * @param message - contains encrypted ticket to be forwarded to contact port owner
 */
export async function createContactPortTicket(
  contactPort: string,
  ticket: string,
  lineId: string,
  message: object,
) {
  try {
    const token = await getToken();
    await axios.post(
      CONTACT_SHARING_TICKET_MANAGEMENT,
      {
        contactPort: contactPort,
        ticket: ticket,
        lineId: lineId,
        message: message,
      },
      {headers: {Authorization: `${token}`}},
    );
  } catch (error: any) {
    if (typeof error === 'object' && error?.response) {
      if (
        error.response?.status === 404 ||
        error.response?.status === 401 ||
        error.response?.status === 400 ||
        error.response?.status === 403
      ) {
        throw new Error('PermissionError');
      }
    }
    console.log('Error pausing contact port: ', error);
    throw new Error('APIError');
  }
}

/**
 * Pause a contact port
 * @param contactPort - contact port to pause
 */
export async function pauseContactPorts(contactPorts: string[]) {
  const token = await getToken();
  try {
    console.log('attempting contact port pause');
    await axios.patch(
      CONTACT_SHARING_PAUSE,
      {
        contactPort: contactPorts,
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
    console.log('Error pausing contact port: ', error);
    throw new Error('APIError');
  }
}

/**
 * resume a contact port
 * @param contactPort - contact port to resume
 */
export async function resumeContactPorts(contactPorts: string[]) {
  console.log('attempting contact port resume');
  const token = await getToken();
  try {
    await axios.patch(
      CONTACT_SHARING_RESUME,
      {
        contactPort: contactPorts,
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
    console.log('Error resuming contact port: ', error);
    throw new Error('APIError');
  }
}
