/**
 * API calls associated with a Group SuperPort.
 */
  import axios from 'axios';

import {
    GROUP_SUPERPORT_CREATION_DELETION,
    GROUP_SUPERPORT_PAUSE,
    GROUP_SUPERPORT_RESUME,
  } from '@configs/api';

  import {getToken} from '@utils/ServerAuth';
  
  /**
   * Fetches a new group superport for a group.
   * @param groupId - groupId of the group.
   * @param limit - optional join limit.
   * @returns - portId of the group superport.
   */
  export async function getNewGroupSuperPort(
    groupId: string,
    limit?: string,
  ): Promise<string> {
    const token = await getToken();
    const response = await axios.post(
      GROUP_SUPERPORT_CREATION_DELETION,
      {
        group_id: groupId,
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
   * Delete a group superport using a superport Id.
   * @param groupSuperportId - portId for the group superport
   * @param groupId - groupId of the group
   */
  export async function deleteGroupSuperport(
    groupSuperportId: string,
    groupId: string,
  ) {
    const token = await getToken();
    try {
      await axios.delete(GROUP_SUPERPORT_CREATION_DELETION, {
        data: {
          superportId: groupSuperportId,
          group_id: groupId,
        },
        headers: {Authorization: `${token}`},
      });
    } catch (error: any) {
      if (typeof error === 'object' && error?.response) {
        if (error.response?.status === 404) {
          console.log(
            'Corresponding group superport does not exist: ',
            groupSuperportId,
          );
          return;
        }
      }
      console.log('Error deleting group superport: ', error);
      throw new Error('APIError');
    }
  }
  
  /**
   * Pause a group superport.
   * @param groupSuperportId - portId for the group superport
   * @param groupId - groupId of the group
   */
  export async function pauseGroupSuperport(
    groupSuperportId: string,
    groupId: string,
  ) {
    const token = await getToken();
    try {
      await axios.patch(
        GROUP_SUPERPORT_PAUSE,
        {
          superportId: groupSuperportId,
          group_id: groupId,
        },
        {
          headers: {Authorization: `${token}`},
        },
      );
    } catch (error: any) {
      if (typeof error === 'object' && error?.response) {
        if (error.response?.status === 404) {
          console.log(
            'Corresponding group superport does not exist: ',
            groupSuperportId,
          );
          return;
        }
      }
      console.log('Error pausing group superport: ', error);
      throw new Error('APIError');
    }
  }
  
  /**
   * resume a group superport.
   * @param groupSuperportId - portId for the group superport
   * @param groupId - groupId of the group
   */
  export async function resumeGroupSuperport(
    groupSuperportId: string,
    groupId: string,
  ) {
    const token = await getToken();
    try {
      await axios.patch(
        GROUP_SUPERPORT_RESUME,
        {
          superportId: groupSuperportId,
          group_id: groupId,
        },
        {
          headers: {Authorization: `${token}`},
        },
      );
    } catch (error: any) {
      if (typeof error === 'object' && error?.response) {
        if (error.response?.status === 404) {
          console.log(
            'Corresponding group superport does not exist: ',
            groupSuperportId,
          );
          return;
        }
      }
      console.log('Error resuming group superport: ', error);
      throw new Error('APIError');
    }
  }
  