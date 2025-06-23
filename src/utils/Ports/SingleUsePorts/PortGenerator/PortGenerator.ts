import {PortBundle} from '@utils/Ports/interfaces';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {PortData} from '@utils/Storage/DBCalls/ports/myPorts';
import { expiryOptions, expiryOptionsTypes } from '@utils/Time/interfaces';

abstract class PortGenerator {
  abstract version: string;
  protected portData: PortData;

  /**
   * Constructor for the PortGenerator class.
   * @param portData - The port data to be used by the generator.
   */
  constructor(portData: PortData) {
    this.portData = portData;
  }

  /**
   * Fetches new ports from the server and saves them to storage.
   */
  static async fetchNewPorts(): Promise<void> {}

  /**
   * Creates a new Port
   * @param contactName - The name of the contact to create the port for.
   * @param folderId - The folder ID to create the port in.
   * @param permissions - The permissions for the port.
   * @param expiry - The expiry for the port. 
   * @returns The created port data.
   */
  static async create(
    contactName: string,
    folderId: string,
    permissions: PermissionsStrict,
    expiry: expiryOptionsTypes = expiryOptions[4],
  ): Promise<PortData | null> {
    console.log(
      'Returns portData of an unused portId',
      contactName,
      folderId,
      permissions,
      expiry
    );
    return null;
  }

  /**
   * Gets the version of the port generator
   * @returns the version of the port generator
   */
  abstract getVersion(): string;

  /**
   * Gets port data
   * @returns port data
   */
  abstract getPort(): PortData;

  /**
   * updates contact name
   * @param name of the contact
   */
  abstract updateContactName(name: string): Promise<void>;

  /**
   * updates permissions
   * @param permissions of the port
   */
  abstract updatePermissions(permissions: PermissionsStrict): Promise<void>;

  /**
   * Gets a shareable bundle
   * @param name name to include in the bundle
   * @returns a bundle
   */
  abstract getShareableBundle(name: string): Promise<PortBundle>;

  /**
   * Gets a shareable link
   * @param name name to include in the link
   * @returns link
   */
  abstract getShareableLink(name: string): Promise<string>;

  /**
   * Deletes port data from storage
   */
  abstract clean(): Promise<void>;

  /**
   * Uses a port to form a new chat
   * @param lineId - The line ID created by the server for the new chat.
   * @param pairHash - The unique pair hash for the user pair.
   * @param introMessage - The intro message sent by the Port reader.
   */
  abstract use(lineId: string, pairHash: string, introMessage: any): Promise<void>;
}

export default PortGenerator;
