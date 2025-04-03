import SuperPortGenerator from '../SuperPortGenerator';
import {SuperportData} from '@utils/Storage/DBCalls/ports/superPorts';
import * as storage from '@utils/Storage/superPorts';
import * as APICalls from '../APICalls';
import CryptoDriver from '@utils/Crypto/CryptoDriver';
import {ORG_NAME} from '@configs/constants';
import {generateISOTimeStamp} from '@utils/Time';
import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';
import {BUNDLE_ID_PREPEND_LINK} from '@configs/api';
import {getBundleId} from '@utils/Ports/APICalls';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {generateRandomHexId} from '@utils/IdGenerator';
import * as permissionStorage from '@utils/Storage/permissions';
import {DirectSuperportBundle} from '@utils/Ports/interfaces';
import {jsonToUrl} from '@utils/JsonToUrl';

const SUPERPORT_GENERATOR_VERSION = '1.0.0';

class SuperPortGenerator_1_0_0 extends SuperPortGenerator {
  version: string = SUPERPORT_GENERATOR_VERSION;

  /**
   * Creates a new super port
   * @param label - The label of the super port
   * @param limit - The limit of the super port
   * @param folderId - The folder id of the super port
   * @param permissions - The permissions of the super port
   * @returns the super port data
   */
  static async create(
    label: string,
    limit: number,
    folderId: string,
    permissions: PermissionsStrict,
  ): Promise<SuperportData | null> {
    try {
      // gets new super port Id
      const portId = await APICalls.getNewDirectSuperport(limit);
      // creates crypto data
      const cryptoDriver = new CryptoDriver();
      await cryptoDriver.create();
      const cryptoId = cryptoDriver.getCryptoId();
      const permissionsId = generateRandomHexId();
      await permissionStorage.addPermissionEntry({
        permissionsId: permissionsId,
        ...permissions,
      });
      const superPortData: SuperportData = {
        portId: portId,
        version: SUPERPORT_GENERATOR_VERSION,
        label: label,
        createdOnTimestamp: generateISOTimeStamp(),
        cryptoId: cryptoId,
        connectionsLimit: limit,
        connectionsMade: 0,
        paused: false,
        permissionsId: permissionsId,
        folderId: folderId,
      };
      await storage.addSuperport(superPortData);
      return superPortData;
    } catch (error) {
      console.log('Error creating super port: ', error);
      return null;
    }
  }

  /**
   * Gets the super port data
   * @returns the super port data
   */
  getPort(): SuperportData {
    return this.portData;
  }

  /**
   * Updates the super port name
   * @param name - The name of the super port
   */
  async updateSuperPortName(name: string): Promise<void> {
    await storage.updateSuperportData(this.portData.portId, {
      label: name,
    });
  }

  /**
   * Updates the super port limit
   * @param limit - The limit of the super port
   */
  async updateSuperPortLimit(limit: number): Promise<void> {
    if (limit < this.portData.connectionsMade) {
      throw new Error(
        'Limit cannot be less than the number of connections made',
      );
    }
    await storage.updateSuperportData(this.portData.portId, {
      connectionsLimit: limit,
    });
  }

  /**
   * Updates the super port permissions
   * @param permissions - The permissions of the super port
   */
  async updateSuperPortPermissions(
    permissions: PermissionsStrict,
  ): Promise<void> {
    await permissionStorage.updatePermissions(
      this.portData.permissionsId,
      permissions,
    );
  }

  /**
   * Pauses the super port
   */
  async pause(): Promise<void> {
    try {
      //paused associated superport
      await APICalls.pauseDirectSuperport(this.portData.portId);
      //pause superport locally
      await storage.pauseSuperport(this.portData.portId);
      this.portData = {...this.portData, paused: true};
    } catch (error) {
      console.log('Error pausing super port: ', error);
    }
  }

  /**
   * Resumes the super port
   */
  async resume(): Promise<void> {
    try {
      //resume a paused superport
      await APICalls.resumeDirectSuperport(this.portData.portId);
      //resume a paused superport locally
      await storage.unpauseSuperport(this.portData.portId);
      this.portData = {...this.portData, paused: false};
    } catch (error) {
      console.log('Error resuming super port: ', error);
    }
  }

  /**
   * Gets a shareable bundle for the super port
   * @param name - The name of the super port
   * @returns the shareable bundle
   */
  async getShareableBundle(name: string): Promise<DirectSuperportBundle> {
    const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
    const rad = await cryptoDriver.getRad();
    const keyHash = await cryptoDriver.getPublicKeyHash();
    const pubkey = await cryptoDriver.getPublicKey();
    // returns a bundle to display
    const displayBundle: DirectSuperportBundle = {
      portId: this.portData.portId,
      version: this.portData.version,
      org: ORG_NAME,
      target: BundleTarget.superportDirect,
      name: name,
      rad: rad,
      keyHash: keyHash,
      pubkey: pubkey,
    };
    return displayBundle;
  }

  /**
   * Gets a shareable link for the super port
   * @param name - The name of the super port
   * @returns the shareable link
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
      const bundleId = await getBundleId(JSON.stringify(bundle), true);
      await storage.updateSuperportData(this.portData.portId, {
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
   * Deletes the super port from server and storage
   */
  async clean(): Promise<void> {
    try {
      await APICalls.deleteDirectSuperport(this.portData.portId);
      await storage.deleteSuperPortData(this.portData.portId);
      if (this.portData.cryptoId) {
        const cryptoDriver = new CryptoDriver(this.portData.cryptoId);
        await cryptoDriver.deleteCryptoData();
      }
      await permissionStorage.clearPermissions(this.portData.permissionsId);
    } catch (error) {
      console.log('Error deleting super port: ', error);
    }
  }
}

export default SuperPortGenerator_1_0_0;
