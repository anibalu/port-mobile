import { PermissionsStrict } from '@utils/Storage/DBCalls/permissions/interfaces';
import { GroupSuperportData } from '@utils/Storage/DBCalls/ports/groupSuperPorts';
import { ReadPortData } from '@utils/Storage/DBCalls/ports/readPorts';
import * as storage from '@utils/Storage/groupSuperPorts';

import { GroupSuperportBundle } from '../interfaces';

import GroupSuperPortGenerator from './GroupSuperPortGenerator/GroupSuperPortGenerator';
import GroupSuperPortGenerator_1_0_0 from './GroupSuperPortGenerator/Versions/GroupSuperPortGenerator_1_0_0';
import GroupSuperPortReader from './GroupSuperPortReader/GroupSuperPortReader';
import GroupSuperPortReader_1_0_0 from './GroupSuperPortReader/Versions/GroupSuperPortReader_1_0_0';


export namespace GroupSuperPort {
  export namespace generator {
    /**
     * The latest version of the group superport generator.
     */
    export const LATEST_VERSION = '1.0.0';

    /**
     * Selects the appropriate group superport generator class based on the version.
     * @param version - The version of the group superport generator to use.
     * @returns The selected group superport generator class.
     */
    export function select(version?: string) {
      if (!version) {
        throw new Error(
          'Version for group superport generator class not specified',
        );
      }
      switch (version) {
        case '1.0.0':
          return GroupSuperPortGenerator_1_0_0;
        default:
          throw new Error(
            `Unsupported version for group superport generator class: ${version}`,
          );
      }
    }

    /**
     * Loads a group superport generator instance based on the provided port data.
     * @param portData - The port data to load the generator for.
     * @returns The loaded group superport generator instance.
     */
    export function load(portData: GroupSuperportData): GroupSuperPortGenerator {
      return new (select(portData.version))(portData);
    }

    /**
     * Loads a group superport generator instance based on the provided portId.
     * @param portId - The portId to load the generator for.
     * @returns The loaded group superport generator instance.
     */
    export async function fromPortId(
      portId: string,
    ): Promise<GroupSuperPortGenerator> {
      //try fetching a group superport from storage using the portId.
      const portData = await storage.getGroupSuperportData(portId);
      if (!portData) {
        throw new Error('No Such Group Superport');
      }
      return load(portData);
    }

    /**
     * Creates a new group superport with the specified groupId.
     * @param groupId - The groupId to create the group superport for.
     * @param version - The version of the group superport generator to use.
     * @returns The created group superport generator instance.
     */
    export async function create(
      groupId: string,
      shouldRegenerate: boolean = false,
      version: string = LATEST_VERSION,
    ): Promise<GroupSuperPortGenerator> {
      const portData = await select(version).create(
        groupId,
        shouldRegenerate,
      );
      if (!portData) {
        throw new Error('NoGroupSuperportWasCreated');
      }
      return load(portData);
    }
  }

  export namespace reader {
    /**
     * The latest version of the group port reader.
     */
    export const LATEST_VERSION = '1.0.0';

    /**
     * Selects the appropriate group superport reader version based on the provided version string.
     * @param version - The version string to select the reader for.
     * @returns The selected group superport reader version.
     * @throws {Error} If the version is not specified or unsupported.
     */
    export function select(version?: string) {
      if (!version) {
        throw new Error(
          'Version for group superport reader class not specified',
        );
      }
      switch (version) {
        case '1.0.0':
          return GroupSuperPortReader_1_0_0;
        default:
          throw new Error(
            `Unsupported version for group superport reader class: ${version}`,
          );
      }
    }

    /**
     * Loads a group superport reader instance based on the provided port data.
     * @param portData - The port data to load the reader for.
     * @returns The loaded group superport reader instance.
     */
    export function load(portData: ReadPortData): GroupSuperPortReader {
      return new (select(portData.version))(portData);
    }

    /**
     * Validates the group superport bundle
     * @param bundleData - The group superport bundle data to validate.
     * @returns The validated group superport bundle.
     * @throws {Error} If the bundle data is invalid.
     */
    export function validateBundle(bundleData: any): GroupSuperportBundle {
      if (!bundleData || !bundleData.version) {
        throw new Error('Invalid bundle data');
      }
      return select(bundleData.version).validateBundle(bundleData);
    }

    /**
     * Accepts a group superport bundle and stores it to use later.
     * @param bundleData - The group superport bundle data to accept.
     * @param permissions - The permissions for the group superport.
     * @param folderId - The folder ID to create the group superport in.
     * @returns The accepted group superport reader instance.
     */
    export async function accept(
      bundleData: GroupSuperportBundle,
      permissions: PermissionsStrict,
      folderId: string,
    ): Promise<GroupSuperPortReader> {
      const portData = await select(bundleData.version).accept(bundleData, permissions, folderId);
      if (!portData) {
        throw new Error('NoGroupSuperportWasAccepted');
      }
      return load(portData);
    }
  }
}
