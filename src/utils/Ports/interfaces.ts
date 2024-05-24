export enum BundleTarget {
  direct,
  group,
  superportDirect,
  superportGroup,
}
export enum PortTable {
  generated,
  read,
  group,
  superport,
}

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
 * Describes the data available in a generated port.
 */
export interface PortDataUpdate {
  version?: string | null;
  label?: string | null;
  usedOnTimestamp?: string | null;
  expiryTimestamp?: string | null;
  channel?: string | null;
  cryptoId?: string | null;
  folderId?: string | null;
}

export interface PortData extends PortDataUpdate {
  portId: string;
  version: string | null;
  label: string | null;
  usedOnTimestamp: string;
  expiryTimestamp: string | null;
  channel: string | null;
  cryptoId: string | null;
  folderId: string;
}

/**
 * Describes the data available in a generated group port.
 */
export interface GroupPortDataUpdate {
  version?: string | null;
  groupId?: string | null;
  usedOnTimestamp?: string | null;
  expiryTimestamp?: string | null;
  channel?: string | null;
  folderId?: string | null;
}
export interface GroupPortData extends GroupPortDataUpdate {
  portId: string;
  version: string;
  groupId: string;
  usedOnTimestamp: string | null;
  expiryTimestamp: string | null;
  channel: string | null;
  folderId: string;
}

/**
 * Describes the data available in a generated superport.
 */
export interface SuperportDataUpdate {
  version?: string | null;
  label?: string | null;
  usedOnTimestamp?: string | null;
  createdOnTimestamp?: string | null;
  channel?: string | null;
  cryptoId?: string | null;
  connectionsLimit?: number | null;
  connectionsMade?: number | null;
  folderId?: string | null;
  paused?: boolean | null;
}
export interface SuperportData extends SuperportDataUpdate {
  portId: string;
  version: string | null;
  label: string;
  usedOnTimestamp: string | null;
  createdOnTimestamp: string;
  channel: string | null;
  cryptoId: string;
  connectionsLimit: number;
  connectionsMade: number;
  folderId: string;
  paused: boolean;
}

export interface UnusedPortData {
  portId: string | null;
  remainingPorts: number;
}

/**
 * Describes the data available in a read port (port, superport, group port).
 */
export interface ReadPortData {
  portId: string;
  version: string;
  target: BundleTarget;
  name: string;
  description?: string | null;
  usedOnTimestamp: string;
  expiryTimestamp: string | null;
  channel: string | null;
  cryptoId: string;
  folderId: string;
}

interface BundleBase {
  portId: string;
  version: string;
  org: string;
  target: BundleTarget;
  name: string;
}

/**
 * Describes data essential for forming a direct connection
 */
interface DirectBundle extends BundleBase {
  rad: string;
  keyHash: string;
  pubkey?: string;
  expiryTimestamp?: string | null; // @deprecated
}

/**shared for a direct Port
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
 * Describes data displayed in a QR or link for a group port
 */
export interface GroupBundle extends BundleBase {
  portId: string;
  version: string;
  org: string;
  target: BundleTarget.group;
  name: string;
  description?: string | null;
  expiryTimestamp: string | null;
}

/**
 * Describes data displayed in a QR or link for a group superport. Currently unsupported
 */
export interface GroupSuperportBundle extends BundleBase {}

/**
 * Describes the data that is required by a pending port card
 */
export interface PendingCardInfo {
  portId: string;
  name: string;
  isLink: boolean;
  createdOn: string;
}
