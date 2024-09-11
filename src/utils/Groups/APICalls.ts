import {
  GROUP_ADMIN_MANAGEMENT_RESOURCE,
  GROUP_EXIT_RESOURCE,
  GROUP_MANAGEMENT_RESOURCE,
  GROUP_MEMBER_REMOVE_RESOURCE,
  GROUP_MEMBER_RESOURCE,
} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';

/**
 * Creates a group on the backend
 * @param pubKey
 * @returns group Id of the group
 */
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

/**
 * Initial information sent by the server regarding a group member.
 */
export interface GroupMemberResponse {
  memberId: string;
  pairHash: string;
  pubkey: string;
  admin: boolean;
}

export async function joinGroup(
  linkId: string,
  pubKey: string,
): Promise<{
  groupId: string;
  groupMembersAuthData: GroupMemberResponse[];
}> {
  const token = await getToken();
  const response = await axios.put(
    GROUP_MEMBER_RESOURCE,
    {
      groupLink: linkId,
      pubkey: pubKey,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data.groupId && response.data.members) {
    const groupId: string = response.data.groupId;
    const members: GroupMemberResponse[] = response.data.members;
    return {groupId: groupId, groupMembersAuthData: members};
  }
  throw new Error('APIError');
}

export async function removeMember(groupId: string, memberId: string) {
  const token = await getToken();
  await axios.patch(
    GROUP_MEMBER_REMOVE_RESOURCE,
    {
      groupId: groupId,
      memberId: memberId,
    },
    {headers: {Authorization: `${token}`}},
  );
}

export async function leaveGroup(groupId: string): Promise<boolean> {
  try {
    const token = await getToken();
    await axios.patch(
      GROUP_EXIT_RESOURCE,
      {
        groupId: groupId,
      },
      {headers: {Authorization: `${token}`}},
    );
    return true;
  } catch (error: any) {
    if (typeof error === 'object' && error.response) {
      if (error.response.status === 403) {
        return true;
      }
    }
  }
  return false;
}

interface AdminManagement {
  groupId: string;
  promoteMember?: string;
  demoteMember?: string;
}

export async function manageAdmin(info: AdminManagement): Promise<boolean> {
  try {
    const token = await getToken();
    await axios.patch(
      GROUP_ADMIN_MANAGEMENT_RESOURCE,
      {
        groupId: info.groupId,
        promoteMember: info.promoteMember,
        demoteMember: info.demoteMember,
      },
      {headers: {Authorization: `${token}`}},
    );
    return true;
  } catch (error: any) {
    return false;
  }
}
