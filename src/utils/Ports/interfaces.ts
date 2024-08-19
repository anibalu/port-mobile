import {BundleTarget} from '@utils/Storage/DBCalls/ports/interfaces';

/**
 * A port bundle is the information in a Port that needs to be shared to form a connection
 * Below interfaces describe the information that is shared when a Port is shared.
 */

/**
 * Associated interfaces for each type of port bundle.
 */
export type BundleType<T extends BundleTarget> = T extends BundleTarget.direct
  ? PortBundle
  : T extends BundleTarget.group
  ? GroupBundle
  : T extends BundleTarget.superportDirect
  ? DirectSuperportBundle
  : T extends BundleTarget.superportGroup
  ? GroupSuperportBundle
  : never;

/**
 * Base params present in a port bundle.
 */
interface BundleBase {
  portId: string;
  version: string;
  org: string;
  target: BundleTarget;
  name: string;
  expiryTimestamp?: string | null; //deprecated
}

/**
 * Describes data essential for forming a direct connection
 */
interface DirectBundle extends BundleBase {
  rad: string;
  keyHash: string;
  pubkey?: string;
}

/**
 * shared for a direct Port
 */
export interface PortBundle extends DirectBundle {
  target: BundleTarget.direct;
}

/**
 * Describes data shared for a direct Superport
 */
export interface DirectSuperportBundle extends DirectBundle {
  target: BundleTarget.superportDirect;
}

/**
 * Describes data shared for a contact port
 */
export interface DirectContactPortBundle extends DirectBundle {
  target: BundleTarget.contactPort;
  ticket?: string | null;
}

/**
 * Describes data shared for a group port
 */
export interface GroupBundle extends BundleBase {
  target: BundleTarget.group;
  description?: string | null;
}

/**
 * Describes data displayed in a QR or link for a group superport. Currently unsupported
 */
export interface GroupSuperportBundle extends BundleBase {}
