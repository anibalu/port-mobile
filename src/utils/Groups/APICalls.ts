import {GROUP_MANAGEMENT_RESOURCE} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';

export async function createGroup(pubKey: string): Promise<string> {
  const token = await getToken();
  const response = await axios.post(
    GROUP_MANAGEMENT_RESOURCE,
    {
      pubkey: pubKey,
    },
    {
      headers: {Authorization: `${token}`},
    },
  );
  if (response.data.newGroup) {
    const groupId: string = response.data.newGroup;
    return groupId;
  } else {
    throw new Error('APIError');
  }
}

export async function joinGroup(
  linkId: string,
  pubKey: string,
): Promise<{
  groupId: string;
  groupMembersAuthData: string[][];
}> {
  const token = await getToken();
  const response = await axios.patch(
    GROUP_MANAGEMENT_RESOURCE,
    {
      updateType: 'join',
      groupLink: linkId,
      pubkey: pubKey,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data.groupId && response.data.members) {
    const groupId: string = response.data.groupId;
    const members: string[][] = response.data.members;
    return {groupId: groupId, groupMembersAuthData: members};
  }
  throw new Error('APIError');
}

export async function removeMember(
  groupId: string,
  memberId: string,
): Promise<boolean> {
  try {
    const token = await getToken();
    await axios.patch(
      GROUP_MANAGEMENT_RESOURCE,
      {
        updateType: 'remove',
        groupId: groupId,
        removeMember: memberId,
      },
      {headers: {Authorization: `${token}`}},
    );
    return true;
  } catch (error) {
    return false;
  }
}

export async function leaveGroup(groupId: string): Promise<boolean> {
  try {
    const token = await getToken();
    await axios.patch(
      GROUP_MANAGEMENT_RESOURCE,
      {
        updateType: 'leave',
        groupId: groupId,
      },
      {headers: {Authorization: `${token}`}},
    );
    return true;
  } catch (error: any) {
    if (typeof error === 'object' && error.response) {
      if (error.response.status === 404 || error.response.status === 500) {
        return true;
      }
    }
  }
  return false;
}
