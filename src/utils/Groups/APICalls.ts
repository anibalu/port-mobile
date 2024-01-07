import {GROUP_MANAGEMENT_RESOURCE} from '@configs/api';
import {getToken} from '@utils/ServerAuth';
import axios from 'axios';
import {GroupData, GroupDataStrict, GroupMemberStrict} from './interfaces';
import {generateISOTimeStamp} from '@utils/Time';
import {DEFAULT_NAME} from '@configs/constants';

export async function createGroup(): Promise<string> {
  const token = await getToken();
  const response = await axios.post(GROUP_MANAGEMENT_RESOURCE, null, {
    headers: {Authorization: `${token}`},
  });
  if (response.data.newGroup) {
    const groupId: string = response.data.newGroup;
    return groupId;
  } else {
    throw new Error('APIError');
  }
}

export async function joinGroup(
  linkId: string,
  groupData: GroupData,
): Promise<{
  groupId: string;
  groupData: GroupDataStrict;
  groupMembers: GroupMemberStrict[];
}> {
  const token = await getToken();
  const response = await axios.patch(
    GROUP_MANAGEMENT_RESOURCE,
    {
      updateType: 'join',
      groupLink: linkId,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data.groupId && response.data.members) {
    const groupId: string = response.data.groupId;
    const members: string[] = response.data.members;
    const groupDataStrict: GroupDataStrict = {
      name: groupData.name ? groupData.name : DEFAULT_NAME,
      joinedAt: groupData.joinedAt
        ? groupData.joinedAt
        : generateISOTimeStamp(),
      description: groupData.description ? groupData.description : null,
      groupPicture: groupData.groupPicture ? groupData.groupPicture : null,
      amAdmin: groupData.amAdmin ? groupData.amAdmin : false,
    };
    const groupMembers: GroupMemberStrict[] = members.map(memberId => {
      const newMember: GroupMemberStrict = {
        memberId: memberId,
        name: null,
        joinedAt: groupDataStrict.joinedAt,
        cryptoId: null,
        isAdmin: null,
      };
      return newMember;
    });
    return {
      groupId: groupId,
      groupData: groupDataStrict,
      groupMembers: groupMembers,
    };
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
