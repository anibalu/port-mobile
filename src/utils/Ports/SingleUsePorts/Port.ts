import {defaultFolderId} from '@configs/constants';

import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import * as storage from '@utils/Storage/myPorts';

import PortGenerator from './PortGenerator/PortGenerator';
import PortGenerator_1_0_0 from './PortGenerator/Versions/PortGenerator_1_0_0';
import PortReader from './PortReader/PortReader';
import PortReader_1_0_0 from './PortReader/Versions/PortReader_1_0_0';


/**
 * Port namespace for handling single-use connection ports.
 * Contains two sub-namespaces:
 * - generator: For creating and managing outgoing ports
 * - reader: For reading and accepting incoming ports
 *
 * Single-use ports are one-time use connection points that can only be used once
 * to establish a connection between two users. After the connection is made, the
 * port becomes invalid.
 */
export namespace Port {
  export namespace generator {
    /**
     * The latest version of the port generator.
     */
    export const LATEST_VERSION = '1.0.0';

    /**
     * Selects the appropriate port generator version based on the provided version string.
     * @param version - The version string to select the generator for.
     * @returns The selected port generator version.
     * @throws {Error} If the version is not specified or unsupported.
     */
    export function select(version?: string) {
      if (!version) {
        throw new Error('Version for port generator class not specified');
      }
      switch (version) {
        case '1.0.0':
          return PortGenerator_1_0_0;
        default:
          throw new Error(
            `Unsupported version for port generator class: ${version}`,
          );
      }
    }

    /**
     * Loads a port generator instance based on the provided port data.
     * @param portData - The port data to load the generator for.
     * @returns The loaded port generator instance.
     */
    export function load(portData: any): PortGenerator {
      return new (select(portData.version))(portData);
    }

    /**
     * Loads a port generator instance based on the provided port ID.
     * @param portId - The ID of the port to load.
     * @returns The loaded port generator instance.
     * @throws {Error} If no port data is found for the given port ID.
     */
    export async function fromPortId(portId: string): Promise<PortGenerator> {
      // fetch a port from storage using the portId.
      const portData = await storage.getPortData(portId);

      if (!portData) {
        throw new Error('NoUsedPortFound');
      }
      return load(portData);
    }

    /**
     * Creates a new port generator instance with the specified folder ID and permissions.
     * @param contactName - The name of the contact to create the port for.
     * @param folderId - The folder ID to create the port in.
     * @param permissions - The permissions for the port.
     * @param version - The version of port generator to use (defaults to latest).
     * @returns A new port generator instance.
     * @throws {Error} If no port could be created.
     */
    export async function create(
      contactName: string,
      folderId: string,
      permissions: PermissionsStrict,
      version: string = LATEST_VERSION,
    ): Promise<PortGenerator> {
      const portData = await select(version).create(
        contactName,
        folderId,
        permissions,
      );
      if (!portData) {
        throw new Error('NoPortWasCreated');
      }
      return load(portData);
    }
  }

  export namespace reader {
    export const LATEST_VERSION = '1.0.0';

    export function select(version?: string) {
      if (!version) {
        throw new Error('Version for port reader class not specified');
      }
      switch (version) {
        case '1.0.0':
          return PortReader_1_0_0;
        default:
          throw new Error(
            `Unsupported version for port reader class: ${version}`,
          );
      }
    }

    export function load(portData: any): PortReader {
      return new (select(portData.version))(portData);
    }

    export async function accept(
      bundleData: any,
      folderId: string = defaultFolderId,
    ) {
      await select(bundleData.version).accept(bundleData, folderId);
    }
  }
}
