import {GROUP_MANAGEMENT_RESOURCE} from '@configs/api';
import {DEFAULT_NAME} from '@configs/constants';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {deriveSharedSecret} from '@utils/Crypto/x25519';
import {getToken} from '@utils/ServerAuth';
import {generateISOTimeStamp} from '@utils/Time';
import axios from 'axios';
import {GroupData, GroupDataStrict, GroupMemberStrict} from './interfaces';

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
  groupData: GroupData,
): Promise<{
  groupId: string;
  groupData: GroupDataStrict;
  groupMembers: GroupMemberStrict[];
}> {
  const cryptoDriver = new CryptoDriver();
  await cryptoDriver.create();
  const pubKey = await cryptoDriver.getPublicKey();
  const selfCryptoId = cryptoDriver.getCryptoId();
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
    console.log('Response for membets: ', members);
    const groupDataStrict: GroupDataStrict = {
      name: groupData.name ? groupData.name : DEFAULT_NAME,
      joinedAt: groupData.joinedAt
        ? groupData.joinedAt
        : generateISOTimeStamp(),
      description: groupData.description ? groupData.description : null,
      groupPicture: groupData.groupPicture ? groupData.groupPicture : null,
      amAdmin: groupData.amAdmin ? groupData.amAdmin : false,
      selfCryptoId: selfCryptoId,
    };
    const promises = members.map(async memberPair => {
      console.log('Group data: ', selfCryptoId);
      const driver = new CryptoDriver(selfCryptoId);
      const driverData = await driver.getData();
      console.log('Driver data is: ', memberPair);
      const sharedSecret = await deriveSharedSecret(
        driverData.privateKey,
        memberPair[1],
      );

      const memberCryptoDriver = new CryptoDriver();
      await memberCryptoDriver.createForMember({
        sharedSecret: sharedSecret,
      });
      console.log('Created cryptoID: ', memberCryptoDriver.getCryptoId());
      const newMember: GroupMemberStrict = {
        memberId: memberPair[0],
        name: null,
        joinedAt: groupDataStrict.joinedAt,
        cryptoId: memberCryptoDriver.getCryptoId(),
        isAdmin: null,
      };
      return newMember;
    });
    const groupMembers: GroupMemberStrict[] = await Promise.all(promises);
    console.log('Group members encr are: ', groupMembers);
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
