import { PermissionsStrict } from '@utils/Storage/DBCalls/permissions/interfaces';
import { ReadPortData } from '@utils/Storage/DBCalls/ports/readPorts';
import { SuperportData } from '@utils/Storage/DBCalls/ports/superPorts';
import * as storage from '@utils/Storage/superPorts';

import { DirectSuperportBundle } from '../interfaces';

import SuperPortGenerator from './SuperPortGenerator/SuperPortGenerator';
import SuperPortGenerator_1_0_0 from './SuperPortGenerator/Versions/SuperPortGenerator_1_0_0';
import SuperPortReader from './SuperPortReader/SuperPortReader';
import SuperPortReader_1_0_0 from './SuperPortReader/Versions/SuperPortReader_1_0_0';



/**
 * SuperPort namespace for handling superport connections.
 * Contains two sub-namespaces:
 * - generator: For creating and managing outgoing superports
 * - reader: For reading and accepting incoming superports
 *
 * Superports are multi-use connection points that can only be used
 * to establish a connection between two users. After the connection is made, the
 * superport remains valid and can be used again.
 */
export namespace SuperPort {
  export namespace generator {
    /**
     * The latest version of the superport generator.
     */
    export const LATEST_VERSION = '1.0.0';

    /**
     * Selects the appropriate superport generator version based on the provided version string.
     * @param version - The version string to select the generator for.
     * @returns The selected superport generator version.
     * @throws {Error} If the version is not specified or unsupported.
     */
    export function select(version?: string) {
      if (!version) {
        throw new Error('Version for superport generator class not specified');
      }
      switch (version) {
        case '1.0.0':
          return SuperPortGenerator_1_0_0;
        default:
          throw new Error(
            `Unsupported version for superport generator class: ${version}`,
          );
      }
    }

    /**
     * Loads a superport generator instance based on the provided port data.
     * @param portData - The port data to load the generator for.
     * @returns The loaded superport generator instance.
     */
    export function load(portData: SuperportData): SuperPortGenerator_1_0_0 {
      return new (select(portData.version))(portData);
    }

    /**
     * Loads a superport generator instance based on the provided portId.
     * @param portId - The portId to load the generator for.
     * @returns The loaded superport generator instance.
     */
    export async function fromPortId(
      portId: string,
    ): Promise<SuperPortGenerator> {
      //try fetching a superport from storage using the portId.
      const portData = await storage.getSuperportData(portId);
      if (!portData) {
        throw new Error('No Such SuperPort');
      }
      return load(portData);
    }

    /**
     * Creates a new superport with the specified label, limit, and permissions.
     * @param label - The label for the superport.
     * @param limit - The limit for the superport.
     * @param permissions - The permissions for the superport.
     * @param version - The version of the superport generator to use.
     * @returns The created superport generator instance.
     */
    export async function create(
      label: string,
      limit: number,
      folderId: string,
      permissions: PermissionsStrict,
      version: string = LATEST_VERSION,
    ): Promise<SuperPortGenerator> {
      const portData = await select(version).create(
        label,
        limit,
        folderId,
        permissions,
      );
      if (!portData) {
        throw new Error('NoSuperPortWasCreated');
      }
      return load(portData);
    }
  }

  export namespace reader {
    /**
     * The latest version of the super port reader
     */
    export const LATEST_VERSION = '1.0.0';

    /**
     * Selects the appropriate super port reader version based on the provided version string.
     * @param version - The version string to select the reader for.
     * @returns The selected super port reader version.
     * @throws {Error} If the version is not specified or unsupported.
     */
    export function select(version?: string) {
      if (!version) {
        throw new Error('Version for superport reader class not specified');
      }
      switch (version) {
        case '1.0.0':
          return SuperPortReader_1_0_0;
        default:
          throw new Error(
            `Unsupported version for superport reader class: ${version}`,
          );
      }
    }

    /**
     * Loads a super port reader instance based on the provided port data.
     * @param portData - The port data to load the reader for.
     * @returns The loaded super port reader instance.
     */
    export function load(portData: ReadPortData): SuperPortReader {
      return new (select(portData.version))(portData);
    }

    /**
     * Validates the super port bundle
     * @param bundleData - The super port bundle data to validate.
     * @returns The validated super port bundle.
     * @throws {Error} If the bundle data is invalid.
     */
    export function validateBundle(bundleData: any): DirectSuperportBundle {
      if (!bundleData || !bundleData.version) {
        throw new Error('Invalid bundle data');
      }
      return select(bundleData.version).validateBundle(bundleData);
    }

    /**
     * Accepts a super port bundle and stores it to use later.
     * @param bundleData - The super port bundle data to accept.
     * @param permissions - The permissions for the super port.
     * @param folderId - The folder ID to create the super port in.
     * @returns The accepted super port reader instance.
     * @throws {Error} If no super port could be created.
     */
    export async function accept(
      bundleData: DirectSuperportBundle,
      permissions: PermissionsStrict,
      folderId: string,
    ): Promise<SuperPortReader> {
      const portData = await select(bundleData.version).accept(bundleData, permissions, folderId);
      if (!portData) {
        throw new Error('NoPortWasAccepted');
      }
      return load(portData);
    }
  }
}
