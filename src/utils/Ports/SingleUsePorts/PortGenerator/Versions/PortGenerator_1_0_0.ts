import {BUNDLE_ID_PREPEND_LINK} from '@configs/api';
import {IDEAL_UNUSED_PORTS_NUMBER, ORG_NAME} from '@configs/constants';

import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {generateRandomHexId} from '@utils/IdGenerator';
import {jsonToUrl} from '@utils/JsonToUrl';
import {getBundleId} from '@utils/Ports/APICalls';
import {PortBundle} from '@utils/Ports/interfaces';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import {PortData} from '@utils/Storage/DBCalls/ports/myPorts';
import * as storage from '@utils/Storage/myPorts';
import * as permissionStorage from '@utils/Storage/permissions';
import {generateISOTimeStamp, getExpiryTimestamp} from '@utils/Time';
import {expiryOptions} from '@utils/Time/interfaces';

import * as API from '../APICalls';
import PortGenerator from '../PortGenerator';

const PORT_GENERATOR_VERSION = '1.0.0';

class PortGenerator_1_0_0 extends PortGenerator {
  version: string = PORT_GENERATOR_VERSION;

  /**
   * Tries to get an unused port from storage.
   * If there are no unused ports, it will get more ports from the server.
   * @returns unused Port Id.
   */
  static async getUnusedPort(): Promise<string> {
    const unusedPort = await storage.getUnusedPort();
    if (
      !unusedPort.portId ||
      unusedPort.remainingPorts < IDEAL_UNUSED_PORTS_NUMBER
    ) {
      // makes an api to get more ports
      try {
        const portIds = await API.getNewPorts();
        await storage.newPorts(portIds);
      } catch (error) {
        console.log('Error getting new ports: ', error);
      }
      if (!unusedPort.portId) {
        const newUnusedPort = await storage.getUnusedPort();
        if (!newUnusedPort.portId) {
          throw new Error('NoAvailabeUnusedPort');
        }
        return newUnusedPort.portId;
      }
      return unusedPort.portId;
    }
    return unusedPort.portId;
  }

  /**
   * Creates a new port with the specified folder ID and permissions.
   * @param contactName - The name of the contact to create the port for.
   * @param folderId - The folder ID to create the port in.
   * @param permissions - The permissions for the port.
   * @returns The created port data.
   */
  static async create(
    contactName: string,
    folderId: string,
    permissions: PermissionsStrict,
  ): Promise<PortData | null> {
    try {
      // gets unused port Id
      const portId = await PortGenerator_1_0_0.getUnusedPort();
      // creates crypto data
      const cryptoDriver = new CryptoDriver();
      await cryptoDriver.create();
      const cryptoId = cryptoDriver.getCryptoId();
      const currentTimestamp = generateISOTimeStamp();
      const expiryTimestamp = getExpiryTimestamp(
        currentTimestamp,
        expiryOptions[4],
      );
      const permissionsId = generateRandomHexId();
      await permissionStorage.addPermissionEntry({
        permissionsId: permissionsId,
        ...permissions,
      });
      const portData: PortData = {
        portId: portId,
        version: PORT_GENERATOR_VERSION,
        label: contactName,
        usedOnTimestamp: currentTimestamp,
        expiryTimestamp: expiryTimestamp,
        cryptoId: cryptoId,
        folderId: folderId,
        permissionsId: permissionsId,
      };
      await storage.updatePortData(portId, portData);
      return portData;
    } catch (error) {
      console.log('Error creating port: ', error);
      return null;
    }
  }

  /**
   * Gets the version of the port generator
   * @returns the version of the port generator
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Gets port data
   * @returns port data
   */
  getPort(): PortData {
    return this.portData;
  }

  /**
   * updates contact name
   * @param name of the contact
   */
  async updateContactName(name: string) {
    await storage.updatePortData(this.portData.portId, {label: name});
  }

  /**
   * updates permissions
   * @param permissions of the port
   */
  async updatePermissions(permissions: PermissionsStrict) {
    await permissionStorage.updatePermissions(
      this.portData.permissionsId,
      permissions,
    );
  }

  /**
   * Gets a shareable bundle
   * @param name of the contact
   * @returns a bundle
   */
  async getShareableBundle(name: string): Promise<PortBundle> {
    const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
    const rad = await cryptoDriver.getRad();
    const keyHash = await cryptoDriver.getPublicKeyHash();
    const pubkey = await cryptoDriver.getPublicKey();
    // returns a bundle to display
    const displayBundle: PortBundle = {
      portId: this.portData.portId,
      version: this.portData.version,
      org: ORG_NAME,
      target: BundleTarget.direct,
      name: name,
      rad: rad,
      keyHash,
      pubkey,
    };
    return displayBundle;
  }

  /**
   * Gets a shareable link for the port
   * @param name Name to include in the shared link
   * @returns A shareable link - either a shortened bundleId link or full port data link
   * @throws Error if unable to generate any valid link
   */
  async getShareableLink(name: string): Promise<string> {
    if (this.portData.bundleId) {
      const bundleId =
        this.portData.bundleId.substring(0, 7) === 'link://'
          ? this.portData.bundleId.replace('link://', '') //to handle older methods of storing bundleId.
          : this.portData.bundleId;
      return BUNDLE_ID_PREPEND_LINK + bundleId;
    }
    //Else create a new shortened link, store it and return it.
    //If that fails, construct the port data as a link.
    const bundle = await this.getShareableBundle(name);
    try {
      const bundleId = await getBundleId(JSON.stringify(bundle));
      await storage.updatePortData(this.portData.portId, {
        bundleId: bundleId,
      });
      this.portData = {...this.portData, bundleId: bundleId};
      return BUNDLE_ID_PREPEND_LINK + bundleId;
    } catch (error) {
      console.log('Error getting shareable link: ', error);
      //If that fails, construct the port data as a link.
      const longLink = jsonToUrl(bundle as any);
      if (!longLink) {
        throw new Error('Error getting shareable link');
      }
      return longLink;
    }
  }

  /**
   * Deletes port data from storage
   */
  async clean() {
    try {
      // deletes port data from storage
      await storage.deletePortData(this.portData.portId);
      if (this.portData.cryptoId) {
        const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
        await cryptoDriver.deleteCryptoData();
      }
      await permissionStorage.clearPermissions(this.portData.permissionsId);
    } catch (error) {
      console.log('Error deleting generated port: ', error);
    }
  }
}

export default PortGenerator_1_0_0;
