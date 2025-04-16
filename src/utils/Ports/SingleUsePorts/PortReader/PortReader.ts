import { PortBundle } from '@utils/Ports/interfaces';
import { PermissionsStrict } from '@utils/Storage/DBCalls/permissions/interfaces';
import { ReadPortData } from '@utils/Storage/DBCalls/ports/readPorts';

abstract class PortReader {
  abstract version: string;
  protected portData: ReadPortData;

  constructor(portData: ReadPortData) {
    this.portData = portData;
  }

  /**
   * Validates the port bundle
   * @param bundleData bundle data received
   * @returns validated port bundle
   * @throws Error if bundle is invalid
   */
  static validateBundle(bundleData: any): PortBundle {
    console.log('Validating read port bundle data: ', bundleData);
    throw new Error('Bundle validation is handled in the version specific classes');
  }

  /**
   * Accepts the port bundle
   * @param bundleData bundle data received
   * @param permissions permissions to be assigned to the chat
   * @param folderId folder id to be assigned to the chat
   * @returns read port data or null if error
   */
  static async accept(bundleData: PortBundle, permissions: PermissionsStrict, folderId: string): Promise<ReadPortData | null> {
    console.log('accepting read port bundle data: ', bundleData, permissions, folderId);
    throw new Error('Accept is handled in the version specific classes');
  }

  /**
   * Cleans up the read port
   */
  abstract clean(): Promise<void>;

  /**
   * Uses the read port to form a chat
   */
  abstract use(): Promise<void>;
}

export default PortReader;
