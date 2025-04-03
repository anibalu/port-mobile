import {PortData} from '@utils/Storage/DBCalls/ports/myPorts';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {PortBundle} from '@utils/Ports/interfaces';

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
   * Creates a new Port
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
    console.log(
      'Returns portData of an unused portId',
      contactName,
      folderId,
      permissions,
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
   * @param name of the contact
   * @returns a bundle
   */
  abstract getShareableBundle(name: string): Promise<PortBundle>;

  /**
   * Gets a shareable link
   * @param name of the contact
   * @returns link
   */
  abstract getShareableLink(name: string): Promise<string>;

  /**
   * Deletes port data from storage
   */
  abstract clean(): Promise<void>;
}

export default PortGenerator;
