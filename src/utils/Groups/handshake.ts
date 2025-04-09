import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {deriveSharedSecret} from '@utils/Crypto/x25519';
import {CryptoDataStrict} from '@utils/Storage/DBCalls/crypto';
import {GroupMemberLoadedData} from '@utils/Storage/DBCalls/groupMembers';

import * as API from './APICalls';

/**
 * Generate a shared secret with a member of the group.
 * @param groupMembersAuthData - info required to perform handshake.
 * @param selfCryptoData - user's crypto data for the group.
 * @param handshakeTime - time the handshake is performed.
 * @returns - group member info
 */
export async function performHandshake(
  groupMembersAuthData: API.GroupMemberResponse,
  selfCryptoData: CryptoDataStrict,
  handshakeTime: string,
): Promise<GroupMemberLoadedData> {
  const sharedSecret = await deriveSharedSecret(
    selfCryptoData.privateKey,
    groupMembersAuthData.pubkey,
  );
  //save member's crypto info.
  const memberCryptoDriver = new CryptoDriver();
  await memberCryptoDriver.createForMember({
    sharedSecret: sharedSecret,
  });
  const newMember: GroupMemberLoadedData = {
    memberId: groupMembersAuthData.memberId,
    pairHash: groupMembersAuthData.pairHash,
    joinedAt: handshakeTime,
    cryptoId: memberCryptoDriver.getCryptoId(),
    isAdmin: groupMembersAuthData.admin,
    deleted: false,
  };
  return newMember;
}

/**
 * Generate a shared secret with every member of the group.
 * @param groupMembersAuthData - array of member info required to perform handshake.
 * @param selfCryptoId - user's cryptoId for the group.
 * @param handshakeTime - time the handshake is performed.
 * @returns - array of group members.
 */
export async function performHandshakes(
  groupMembersAuthData: API.GroupMemberResponse[],
  selfCryptoId: string,
  handshakeTime: string,
): Promise<GroupMemberLoadedData[]> {
  //load up our keys for the group.
  const driver = new CryptoDriver(selfCryptoId);
  const driverData = await driver.getData();
  const groupMembers: GroupMemberLoadedData[] = [];
  for (const member of groupMembersAuthData) {
    try {
      const newMember = await performHandshake(
        member,
        driverData,
        handshakeTime,
      );
      groupMembers.push(newMember);
    } catch (error) {
      console.error(
        '[Error performing handshake with member]: ',
        member,
        error,
      );
    }
  }
  return groupMembers;
}
