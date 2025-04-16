import { GroupBundle } from "@utils/Ports/interfaces";
import { PermissionsStrict } from "@utils/Storage/DBCalls/permissions/interfaces";
import { ReadPortData } from "@utils/Storage/DBCalls/ports/readPorts";

abstract class GroupPortReader {
  abstract version: string;
  protected portData: ReadPortData;

  constructor(portData: ReadPortData) {
    this.portData = portData;
  }

  /**
   * Validates the group port bundle
   * @param bundleData - The group port bundle data to validate.
   * @returns The validated group port bundle.
   * @throws {Error} If the bundle data is invalid.
   */
  static validateBundle(bundleData: any): GroupBundle {
    console.log('Validating read group port bundle data: ', bundleData);
    throw new Error('Bundle validation is handled in the version specific classes');
  }

  /**
   * Accepts the group port bundle
   * @param bundleData bundle data received
   * @param permissions permissions to be assigned to the chat
   * @param folderId folder id to be assigned to the chat
   * @returns read port data or null if error
   */
  static async accept(bundleData: any, permissions: PermissionsStrict, folderId: string): Promise<ReadPortData | null> {
    console.log('accepting read group port bundle data: ', bundleData, permissions, folderId);
    throw new Error('Accept is handled in the version specific classes');
  }

  /**
   * Cleans up the group port
   */
  abstract clean(): Promise<void>;

  /**
   * Uses the group port to join a group chat
   */
  abstract use(): Promise<void>;
}

export default GroupPortReader;