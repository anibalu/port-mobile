import { DirectContactPortBundle } from "@utils/Ports/interfaces";
import { PermissionsStrict } from "@utils/Storage/DBCalls/permissions/interfaces";
import { ReadPortData } from "@utils/Storage/DBCalls/ports/readPorts";

abstract class ContactPortReader {
  abstract version: string;
  protected portData: ReadPortData;

  constructor(portData: ReadPortData) {
    this.portData = portData;
  }

  /**
   * Validates the contact port bundle
   * @param bundleData - The contact port bundle data to validate.
   * @returns The validated contact port bundle.
   * @throws {Error} If the bundle data is invalid.
   */
  static validateBundle(bundleData: any): DirectContactPortBundle {
    console.log('Validating read contact port bundle data: ', bundleData);
    throw new Error('Bundle validation is handled in the version specific classes');
  }

  /**
   * Accepts the contact port bundle
   * @param bundleData - The contact port bundle data to accept.
   * @param permissions - The permissions to assign to the contact port.
   * @param folderId - The folder ID to assign to the contact port.
   * @returns The accepted contact port bundle.
   */
  static async accept(bundleData: any, permissions: PermissionsStrict, folderId: string): Promise<ReadPortData | null> {
    console.log('accepting read contact port bundle data: ', bundleData, permissions, folderId);
    throw new Error('Accept is handled in the version specific classes');
  }

  /**
   * Cleans up the contact port
   */
  abstract clean(): Promise<void>;

  /**
   * Uses the contact port
   */
  abstract use(): Promise<void>;
}

export default ContactPortReader;