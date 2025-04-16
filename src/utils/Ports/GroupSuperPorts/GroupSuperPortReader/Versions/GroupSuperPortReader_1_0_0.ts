import { z } from 'zod';

import {DEFAULT_GROUP_NAME, NAME_LENGTH_LIMIT, ORG_NAME} from '@configs/constants';

import CryptoDriver from '@utils/Crypto/CryptoDriver';
import Group from '@utils/Groups/GroupClass';
import { readerInitialInfoSend } from '@utils/Groups/InitialInfoExchange';
import { generateRandomHexId } from '@utils/IdGenerator';
import { GroupSuperportBundle } from '@utils/Ports/interfaces';
import { PermissionsStrict } from '@utils/Storage/DBCalls/permissions/interfaces';
import { BundleTarget } from '@utils/Storage/DBCalls/ports/interfaces';
import { ReadPortData } from '@utils/Storage/DBCalls/ports/readPorts';
import * as permissionStorage from '@utils/Storage/permissions';
import * as storageReadPorts from '@utils/Storage/readPorts';
import {generateISOTimeStamp, hasExpired} from '@utils/Time';

import GroupSuperPortReader from '../GroupSuperPortReader';


const GROUP_SUPERPORT_READER_VERSION = '1.0.0';

const GroupSuperPortBundleSchema = z.object({
  portId: z.string().length(32).regex(/^[0-9a-f]{32}$/),
  version: z.literal('1.0.0'),
  org: z.literal(ORG_NAME),
  target: z.literal(BundleTarget.superportGroup),
  name: z.string().max(NAME_LENGTH_LIMIT).optional(),
  expiryTimestamp: z.string().datetime().optional(),
  description: z.string().optional(),
});

type GroupSuperPortBundle_1_0_0 = z.infer<typeof GroupSuperPortBundleSchema>;

class GroupSuperPortReader_1_0_0 extends GroupSuperPortReader {
  version: string = GROUP_SUPERPORT_READER_VERSION;

  /**
   * Validates the group superport bundle
   * @param bundleData bundle data received
   * @returns validated port bundle
   * @throws Error if bundle is invalid
   */
  static validateBundle(bundleData: any): GroupSuperportBundle {
    const parsedBundle: GroupSuperPortBundle_1_0_0 = GroupSuperPortBundleSchema.parse(bundleData);
    // GroupSuperportBundle is a superset of GroupSuperPortBundle_1_0_0
    return parsedBundle as GroupSuperportBundle;
  }

  /**
   * Accepts a group superport bundle
   * @param bundleData bundle data received
   * @param permissions permissions to be assigned to the chat
   * @param folderId folder id to be assigned to the chat
   * @returns read port data or null if error
   */
  static async accept(bundleData: GroupSuperportBundle, permissions: PermissionsStrict, folderId: string): Promise<ReadPortData | null> {
    try {
      //we can assume that bundle data is validated
      const validatedBundle = bundleData as GroupSuperPortBundle_1_0_0;
      //setup crypto
      const cryptoDriver = new CryptoDriver();
      await cryptoDriver.create();
      const cryptoId = cryptoDriver.getCryptoId();
      //setup permissions
      const permissionsId = generateRandomHexId();
      await permissionStorage.addPermissionEntry({
        permissionsId: permissionsId,
        ...permissions,
      });
      const portData: ReadPortData = {
        portId: validatedBundle.portId,
        version: validatedBundle.version,
        target: validatedBundle.target,
        name: validatedBundle.name || DEFAULT_GROUP_NAME,
        description: validatedBundle.description,
        usedOnTimestamp: generateISOTimeStamp(),
        expiryTimestamp: validatedBundle.expiryTimestamp,
        folderId: folderId,
        cryptoId: cryptoId,
        permissionsId: permissionsId,
      }
      //save read port
      await storageReadPorts.newReadPort(portData);
      return portData;
    } catch (error) {
      console.error('Error accepting group port bundle: ', error);
      return null;
    }
  }

  /**
   * Cleans up the read port
   */
  async clean() {
    try {
      //delete read port from storage
      await storageReadPorts.deleteReadPortData(this.portData.portId);
      if (this.portData.cryptoId) {
        const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
        await cryptoDriver.deleteCryptoData();
      }
      if (this.portData.permissionsId) {
        await permissionStorage.clearPermissions(this.portData.permissionsId);
      }
    } catch (error) {
      console.log('Error cleaning up read port: ', error);
    }
  }

  /**
   * Creates default permissions for the read port in case it doesn't exist.
   * Read Ports before version 1.0.0 might not have permissions.
   */
  private async createPermissions() {
    const permissionsId = generateRandomHexId();
    const defaultPermissions = await permissionStorage.getPermissions();
    await permissionStorage.addPermissionEntry({
      permissionsId: permissionsId,
      ...defaultPermissions,
    });
    this.portData = { ...this.portData, permissionsId: permissionsId };
    await storageReadPorts.updateReadPort(this.portData.portId, this.portData);
  }

  /**
   * Uses the read port to form a chat
   */
  async use(): Promise<void> {
    try {
      //run basic checks
      //check cryptoId exists
      if (!this.portData.cryptoId) {
        throw new Error('NoCryptoId');
      }
      //if permissions don't exist, create them.
      if (!this.portData.permissionsId) {
        await this.createPermissions();
      }
      //check timestamp expiry
      if (hasExpired(this.portData.expiryTimestamp)) {
        await this.clean();
        return;
      }
      const chat = await Group.join(
        this.portData.portId,
        true,
        {
          name: this.portData.name,
          amAdmin: false,
          description: this.portData.description,
          joinedAt: this.portData.usedOnTimestamp,
          permissionsId: this.portData.permissionsId,
          selfCryptoId: this.portData.cryptoId,
          disconnected: false,
          initialMemberInfoReceived: false,
        },
        this.portData.folderId,
      );
      //delete used port after chat is formed.
      await storageReadPorts.deleteReadPortData(this.portData.portId);
      //send initial messages
      await readerInitialInfoSend(chat.getChatId());
    } catch (error: any) {
      console.log('Error Joining Group: ', error);
      if (typeof error === 'object' && error.response) {
        if (error.response.status === 404) {
          //404 error indicates an expired or an unuseable Port.
          console.log('Port Has Expired. Cleaning Up Port');
          await this.clean();
        }
      }
    }
  }
}

export default GroupSuperPortReader_1_0_0;