import * as storageContactPorts from "@utils/Storage/contactPorts";
import { PermissionsStrict } from "@utils/Storage/DBCalls/permissions/interfaces";
import { AcceptedContactPortData, ContactPortData } from "@utils/Storage/DBCalls/ports/contactPorts";
import { ReadPortData } from "@utils/Storage/DBCalls/ports/readPorts";

import { DirectContactPortBundle } from "../interfaces";

import AcceptedContactPortGenerator from "./AcceptedContactPortGenerator/AcceptedContactPortGenerator";
import AcceptedContactPortGenerator_1_0_0 from "./AcceptedContactPortGenerator/Versions/AcceptedContactPortGenerator_1_0_0";
import ContactPortReader from "./ContactPortReader/ContactPortReader";
import ContactPortReader_1_0_0 from "./ContactPortReader/Versions/ContactPortReader_1_0_0";
import SharedContactPortGenerator from "./SharedContactPortGenerator/SharedContactPortGenerator";
import SharedContactPortGenerator_1_0_0 from "./SharedContactPortGenerator/Versions/SharedContactPortGenerator_1_0_0";





export namespace ContactPort {
  export namespace generator {
    /**
     * Names space for methods associated with accepted contact ports.
     * Note that accepted contact ports are created by another user and are accepted by the user.
     * These ports can be used to create shareable contact port bundles.
     */
    export namespace accepted {
      /**
       * The latest version of the contact port generator (accepted contact ports).
       */
      export const LATEST_VERSION = '1.0.0';

      /**
       * Selects the appropriate contact port generator version based on the provided version string.
       * @param version - The version string to select the generator for.
       * @returns The selected contact port generator version.
       */
      export function select(version?: string) {
        if (!version) {
          throw new Error('Version for contact port generator class not specified');
        }
        switch (version) {
          case '1.0.0':
            return AcceptedContactPortGenerator_1_0_0;
          default:
            throw new Error(`Unsupported version for contact port generator class: ${version}`);
        }
      }

      /**
       * Loads a contact port generator instance based on the provided port data.
       * @param portData - The port data to load the generator for.
       * @returns The loaded contact port generator instance.
       */
      export function load(portData: AcceptedContactPortData): AcceptedContactPortGenerator {
        return new (select(portData.version))(portData);
      }

      /**
       * Loads a contact port generator instance based on the provided pair hash.
       * @param pairHash - The pair hash to load the generator for.
       * @returns The loaded contact port generator instance.
       */
      export async function fromPairHash(pairHash: string): Promise<AcceptedContactPortGenerator> {
        //try fetching an accepted contact port for a contact from storage using the pairHash.
        const portData = await storageContactPorts.getAcceptedContactPortDataFromPairHash(pairHash);
        if (!portData) {
          throw new Error('No such accepted contact port');
        }
        return load(portData);
      }

      /**
       * Loads a contact port generator instance based on the provided port ID.
       * @param portId - The port ID to load the generator for.
       * @returns The loaded contact port generator instance.
       */
      export async function fromPortId(portId: string): Promise<AcceptedContactPortGenerator> {
        const portData = await storageContactPorts.getAcceptedContactPortData(portId);
        if (!portData) {
          throw new Error('No such accepted contact port');
        }
        return load(portData);
      }

      /**
       * Validates the contact port bundle as a bundle from which an accepted contact port can be created.
       * @param bundleData - The contact port bundle data to validate.
       * @returns The validated contact port bundle.
       */
      export function validateBundle(bundleData: any): DirectContactPortBundle {
        if (!bundleData || !bundleData.version) {
          throw new Error('Invalid bundle data');
        }
        return select(bundleData.version).validateBundle(bundleData);
      }

      /**
       * Creates a new accepted contact port.
       * @param pairHash - The pair hash to create the contact port for.
       * @param bundleData - The contact port bundle data to create the contact port from.
       * @returns The created contact port generator instance.
       */
      export async function create(pairHash: string, bundleData: DirectContactPortBundle): Promise<AcceptedContactPortGenerator> {
        const portData = await select(bundleData.version).create(pairHash, bundleData);
        if (!portData) {
          throw new Error('NoPortWasCreated');
        }
        return load(portData);
      }
    }

    /**
     * Names space for methods associated with shared contact ports.
     * Note that shared contact ports are created by the user and are not accepted from another user.
     * These ports cannot be directly used to create shareable contact port bundles.
     * Instead, they are shared as bundles with contacts.
     * These contacts accept them and use them to create shareable contact port bundles.
     */
    export namespace shared {
      /**
       * The latest version of the contact port generator (shared contact ports).
       */
      export const LATEST_VERSION = '1.0.0';

      /**
       * Selects the appropriate contact port generator version based on the provided version string.
       * @param version - The version string to select the generator for.
       * @returns The selected contact port generator version.
       */
      export function select(version?: string) {
        if (!version) {
          throw new Error('Version for contact port generator class not specified');
        }
        switch (version) {
          case '1.0.0':
            return SharedContactPortGenerator_1_0_0;
          default:
            throw new Error(`Unsupported version for contact port generator class: ${version}`);
        }
      }

      /**
       * Loads a contact port generator instance based on the provided port data.
       * @param portData - The port data to load the generator for.
       * @returns The loaded contact port generator instance.
       */
      export function load(portData: ContactPortData): SharedContactPortGenerator {
        return new (select(portData.version))(portData);
      }

      /**
       * Loads a contact port generator instance based on the provided port ID.
       * @param portId - The port ID to load the generator for.
       * @returns The loaded contact port generator instance.
       */
      export async function fromPortId(portId: string): Promise<SharedContactPortGenerator> {
        const portData = await storageContactPorts.getContactPortData(portId);
        if (!portData) {
          throw new Error('No such shared contact port');
        }
        return load(portData);
      }

      /**
       * Loads a contact port generator instance based on the provided pair hash.
       * @param pairHash - The pair hash to load the generator for.
       * @returns The loaded contact port generator instance.
       */
      export async function fromPairHash(pairHash: string): Promise<SharedContactPortGenerator> {
        const portData = await storageContactPorts.getContactPortDataFromPairHash(pairHash);
        if (!portData) {
          throw new Error('No such shared contact port');
        }
        return load(portData);
      }

      /**
       * Creates a new shared contact port.
       * @param pairHash - The pair hash to create the contact port for.
       * @param folderId - The folder ID to create the contact port in.
       * @param permissions - The permissions for the contact port.
       * @param version - The version of the contact port generator to use.
       * @returns The created contact port generator instance.
       */
      export async function create(pairHash: string, folderId: string, permissions: PermissionsStrict, version: string = LATEST_VERSION): Promise<SharedContactPortGenerator> {
        const portData = await select(version).create(pairHash, folderId, permissions);
        if (!portData) {
          throw new Error('NoPortWasCreated');
        }
        return load(portData);
      }
    }
  }

  export namespace reader {
    /**
     * The latest version of the contact port reader.
     */
    export const LATEST_VERSION = '1.0.0';

    /**
     * Selects the appropriate contact port reader version based on the provided version string.
     * @param version - The version string to select the reader for.
     * @returns The selected contact port reader version.
     */
    export function select(version?: string) {
      if (!version) {
        throw new Error('Version for contact port reader class not specified');
      }
      switch (version) {
        case '1.0.0':
          return ContactPortReader_1_0_0;
        default:
          throw new Error(`Unsupported version for contact port reader class: ${version}`);
      }
    }

    /**
     * Loads a contact port reader instance based on the provided port data.
     * @param portData - The port data to load the reader for.
     * @returns The loaded contact port reader instance.
     */
    export function load(portData: ReadPortData): ContactPortReader {
      return new (select(portData.version))(portData);
    }

    /**
     * Validates the contact port bundle
     * @param bundleData - The contact port bundle data to validate.
     * @returns The validated contact port bundle.
     */ 
    export function validateBundle(bundleData: any): DirectContactPortBundle {
      if (!bundleData || !bundleData.version) {
        throw new Error('Invalid bundle data');
      }
      return select(bundleData.version).validateBundle(bundleData);
    }   

    /**
     * Accepts a contact port bundle and stores it to use later.
     * @param bundleData - The contact port bundle data to accept.
     * @param permissions - The permissions for the contact port.
     * @param folderId - The folder ID to create the contact port in.
     * @returns The accepted contact port reader instance.
     */ 
    export async function accept(bundleData: DirectContactPortBundle, permissions: PermissionsStrict, folderId: string): Promise<ContactPortReader> {
      const portData = await select(bundleData.version).accept(bundleData, permissions, folderId);
      if (!portData) {
        throw new Error('NoPortWasAccepted');
      }
      return load(portData);
    }
  }
}

