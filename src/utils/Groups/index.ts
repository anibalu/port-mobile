import {ServerAuthToken} from '@utils/ServerAuth/interfaces';
import axios from 'axios';
import {GROUP_MANAGEMENT_RESOURCE} from '@configs/api';
import {DEFAULT_NAME} from '@configs/constants';
import {defaultGroupPermissions} from '../ChatPermissions/default';
import {addConnection, updateConnection} from '../Connections';
import {ConnectionType, ReadStatus} from '../Connections/interfaces';
import {ContentType} from '../Messaging/interfaces';
import {getToken} from '../ServerAuth';
import * as storage from '../Storage/group';
import {connectionFsSync} from '../Synchronization';
import {generateISOTimeStamp} from '../Time';
import {GroupInfo, GroupInfoUpdate, GroupMember} from './interfaces';

/**
 * A request to the server to create a new group and return groupId
 * @returns {string} - GroupId of the new group
 */
export async function attemptNewGroup(): Promise<string> {
  //axios request that returns a group Id in response.
  const token = await getToken();
  const response = await axios.post(GROUP_MANAGEMENT_RESOURCE, null, {
    headers: {Authorization: `${token}`},
  });
  if (response.data.newGroup !== undefined) {
    const groupId: string = response.data.newGroup;
    return groupId;
  } else {
    throw new Error('APIError');
  }
}

/**
 * A request to the server to join the group associated with a connectionLinkId.
 * @param {string} connectionLinkId - connectionLinkId used to join a group.
 */
export async function attemptJoinGroup(connectionLinkId: string) {
  const token = await getToken();
  const response = await axios.patch(
    GROUP_MANAGEMENT_RESOURCE,
    {
      updateType: 'join',
      groupLink: connectionLinkId,
    },
    {headers: {Authorization: `${token}`}},
  );
  if (response.data.groupId !== undefined) {
    const groupId: string = response.data.groupId;
    const members: string[] = response.data.members || [];
    return {groupId: groupId, members: members};
  }
  throw new Error('APIError');
}

export async function attemptRemoveMember(groupId: string, memberId: string) {
  const token = await getToken();
  const response = await axios.patch(
    GROUP_MANAGEMENT_RESOURCE,
    {
      updateType: 'remove',
      groupId: groupId,
      removeMember: memberId,
    },
    {headers: {Authorization: `${token}`}},
  );
  console.log('response of remove: ', response.data);
}

export async function addNewGroup(groupInfo: GroupInfo) {
  //save group info
  await storage.saveGroupInfo(groupInfo, true);
  //add new group to connections
  await addConnection({
    chatId: groupInfo.groupId,
    connectionType: ConnectionType.group,
    name: groupInfo.name,
    permissions: defaultGroupPermissions,
    recentMessageType: ContentType.newChat,
    readStatus: ReadStatus.new,
    authenticated: false,
    timestamp: generateISOTimeStamp(),
    newMessageCount: 0,
  });
}

export async function updateGroupInfo(update: GroupInfoUpdate) {
  const synced = async () => {
    const groupInfo = await storage.getGroupInfo(update.groupId, false);
    await storage.saveGroupInfo({...groupInfo, ...update}, false);
  };
  await connectionFsSync(synced);
}

export async function updateNewMember(groupId: string, memberId: string) {
  const synced = async () => {
    let groupInfo = await storage.getGroupInfo(groupId, false);
    if (
      groupInfo.members.findIndex(member => member.memberId === memberId) === -1
    ) {
      groupInfo.members = [...groupInfo.members, initialMemberInfo(memberId)];
      await storage.saveGroupInfo(groupInfo, false);
    }
  };
  await connectionFsSync(synced);
}
export async function removeMember(groupId: string, memberId: string) {
  const synced = async () => {
    let groupInfo = await storage.getGroupInfo(groupId, false);
    groupInfo.members = groupInfo.members.filter(
      member => member.memberId !== memberId,
    );
    await storage.saveGroupInfo(groupInfo, false);
  };
  await connectionFsSync(synced);
}

export function initialMemberInfo(memberId: string) {
  const memberInfo: GroupMember = {
    memberId: memberId,
    name: DEFAULT_NAME,
    joinedAt: generateISOTimeStamp(),
  };
  return memberInfo;
}
export function getInitialGroupMembersInfo(members: string[]) {
  return members.map(member => initialMemberInfo(member));
}

export async function getMemberInfo(groupId: string, memberId: string) {
  try {
    const groupInfo = await storage.getGroupInfo(groupId, true);
    const index = groupInfo.members.findIndex(
      member => member.memberId === memberId,
    );
    if (index === -1) {
      throw new Error('No such member error');
    } else {
      return groupInfo.members[index];
    }
  } catch (error) {
    console.log('error fetching group member information: ', error);
    return {};
  }
}

export function extractMemberInfo(
  groupInfo: any | GroupInfo,
  memberId: string,
) {
  try {
    if (groupInfo.members === undefined) {
      throw new Error('No member variable in group info');
    }
    const index = groupInfo.members.findIndex(
      member => member.memberId === memberId,
    );
    if (index === -1) {
      throw new Error('No such member error');
    } else {
      return groupInfo.members[index];
    }
  } catch (error) {
    console.log('error fetching group member infor: ', error);
    return {};
  }
}

export async function updateMemberName(
  groupId: string,
  memberId: string,
  newName: string,
) {
  const synced = async () => {
    let groupInfo = await storage.getGroupInfo(groupId, false);
    const index = groupInfo.members.findIndex(
      member => member.memberId === memberId,
    );
    if (index !== -1) {
      groupInfo.members[index] = {...groupInfo.members[index], name: newName};
      await storage.saveGroupInfo(groupInfo, false);
    }
  };
  await connectionFsSync(synced);
}

export async function leaveGroup(groupId: string) {
  const token: ServerAuthToken = await getToken();
  await axios.patch(
    GROUP_MANAGEMENT_RESOURCE,
    {
      updateType: 'leave',
      groupId: groupId,
    },
    {headers: {Authorization: `${token}`}},
  );
  await updateConnection({chatId: groupId, disconnected: true});
}
