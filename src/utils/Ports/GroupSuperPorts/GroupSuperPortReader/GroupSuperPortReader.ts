import { GroupSuperportBundle } from "@utils/Ports/interfaces";
import { PermissionsStrict } from "@utils/Storage/DBCalls/permissions/interfaces";
import { ReadPortData } from "@utils/Storage/DBCalls/ports/readPorts";

abstract class GroupSuperPortReader {
  abstract version: string;
  protected portData: ReadPortData;

  constructor(portData: ReadPortData) {
    this.portData = portData;
  }

  /**
   * Validates the group superport bundle
   * @param bundleData - The group superport bundle data to validate.
   * @returns The validated group superport bundle.
   * @throws {Error} If the bundle data is invalid.
   */
  static validateBundle(bundleData: any): GroupSuperportBundle {
    console.log('Validating read group superport bundle data: ', bundleData);
    throw new Error('Bundle validation is handled in the version specific classes');
  }

  /**
   * Accepts the group superport bundle
   * @param bundleData bundle data received
   * @param permissions permissions to be assigned to the chat
   * @param folderId folder id to be assigned to the chat
   * @returns read port data or null if error
   */
  static async accept(bundleData: any, permissions: PermissionsStrict, folderId: string): Promise<ReadPortData | null> {
    console.log('accepting read group superport bundle data: ', bundleData, permissions, folderId);
    throw new Error('Accept is handled in the version specific classes');
  }

  /**
   * Cleans up the group superport
   */
  abstract clean(): Promise<void>;

  /**
   * Uses the group superport to join a group chat
   */
  abstract use(): Promise<void>;
}

export default GroupSuperPortReader;