import { PermissionsStrict } from '@utils/Storage/DBCalls/permissions/interfaces';
import { GroupPortData } from '@utils/Storage/DBCalls/ports/groupPorts';
import { ReadPortData } from '@utils/Storage/DBCalls/ports/readPorts';
import * as storage from '@utils/Storage/groupPorts';

import { GroupBundle } from '../interfaces';

import GroupPortGenerator from './GroupPortGenerator/GroupPortGenerator';
import GroupPortGenerator_1_0_0 from './GroupPortGenerator/Versions/GroupPortGenerator_1_0_0';
import GroupPortReader from './GroupPortReader/GroupPortReader';
import GroupPortReader_1_0_0 from './GroupPortReader/Versions/GroupPortReader_1_0_0';



export namespace GroupPort {
  export namespace generator {
    /**
     * The latest version of the group generator.
     */
    export const LATEST_VERSION = '1.0.0';

    /**
     * Selects the appropriate group generator class based on the version.
     * @param version - The version of the group generator to use.
     * @returns The selected group generator class.
     */
    export function select(version?: string) {
      if (!version) {
        throw new Error(
          'Version for group generator class not specified',
        );
      }
      switch (version) {
        case '1.0.0':
          return GroupPortGenerator_1_0_0;
        default:
          throw new Error(
            `Unsupported version for group generator class: ${version}`,
          );
      }
    }

    /**
     * Loads a group generator instance based on the provided port data.
     * @param portData - The port data to load the generator for.
     * @returns The loaded group generator instance.
     */
    export function load(portData: GroupPortData): GroupPortGenerator {
      return new (select(portData.version))(portData);
    }

    /**
     * Loads a group port generator instance based on the provided portId.
     * @param portId - The portId to load the generator for.
     * @returns The loaded group port generator instance.
     */
    export async function fromPortId(
      portId: string,
    ): Promise<GroupPortGenerator> {
      //try fetching a group port from storage using the portId.
      const portData = await storage.getGroupPortData(portId);
      if (!portData) {
        throw new Error('No Such Group Port');
      }
      return load(portData);
    }

    /**
     * Creates a new group port with the specified groupId.
     * @param groupId - The groupId to create the group port for.
     * @param version - The version of the group port generator to use.
     * @returns The created group port generator instance.
     */
    export async function create(
      groupId: string,
      version: string = LATEST_VERSION,
    ): Promise<GroupPortGenerator> {
      const portData = await select(version).create(
        groupId,
      );
      if (!portData) {
        throw new Error('NoGroupPortWasCreated');
      }
      return load(portData);
    }

    /**
     * Fetches new group ports from the server and saves them to storage.
     */
    export async function fetchNewGroupPorts(groupId: string, version: string = LATEST_VERSION): Promise<void> {
      await select(version).fetchNewGroupPorts(groupId);
    }
  }

  export namespace reader {
    /**
     * The latest version of the group port reader.
     */
    export const LATEST_VERSION = '1.0.0';

    /**
     * Selects the appropriate group port reader version based on the provided version string.
     * @param version - The version string to select the reader for.
     * @returns The selected group port reader version.
     * @throws {Error} If the version is not specified or unsupported.
     */
    export function select(version?: string) {
      if (!version) {
        throw new Error(
          'Version for group reader class not specified',
        );
      }
      switch (version) {
        case '1.0.0':
          return GroupPortReader_1_0_0;
        default:
          throw new Error(
            `Unsupported version for group reader class: ${version}`,
          );
      }
    }

    /**
     * Loads a group port reader instance based on the provided port data.
     * @param portData - The port data to load the reader for.
     * @returns The loaded group port reader instance.
     */
    export function load(portData: ReadPortData): GroupPortReader {
      return new (select(portData.version))(portData);
    }

    /**
     * Validates the group port bundle
     * @param bundleData - The group port bundle data to validate.
     * @returns The validated group port bundle.
     * @throws {Error} If the bundle data is invalid.
     */
    export function validateBundle(bundleData: any): GroupBundle {
      if (!bundleData || !bundleData.version) {
        throw new Error('Invalid bundle data');
      }
      return select(bundleData.version).validateBundle(bundleData);
    }

    /**
     * Accepts a group port bundle and stores it to use later.
     * @param bundleData - The group port bundle data to accept.
     * @param permissions - The permissions for the group port.
     * @param folderId - The folder ID to create the group port in.
     * @returns The accepted group port reader instance.
     */
    export async function accept(
      bundleData: GroupBundle,
      permissions: PermissionsStrict,
      folderId: string,
    ): Promise<GroupPortReader> {
      const portData = await select(bundleData.version).accept(bundleData, permissions, folderId);
      if (!portData) {
        throw new Error('NoGroupPortWasAccepted');
      }
      return load(portData);
    }
  }
}
