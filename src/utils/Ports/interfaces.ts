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

export interface PortDataUpdate {
  version?: string | null;
  label?: string | null;
  usedOnTimestamp?: string | null;
  expiryTimestamp?: string | null;
  channel?: string | null;
  cryptoId?: string | null;
  permissionPresetId?: string | null;
}

export interface PortData extends PortDataUpdate {
  portId: string;
  version: string | null;
  label: string | null;
  usedOnTimestamp: string;
  expiryTimestamp: string | null;
  channel: string | null;
  cryptoId: string | null;
  permissionPresetId?: string | null;
}

export interface GroupPortDataUpdate {
  version?: string | null;
  groupId?: string | null;
  usedOnTimestamp?: string | null;
  expiryTimestamp?: string | null;
  channel?: string | null;
}

export interface GroupPortData extends GroupPortDataUpdate {
  portId: string;
  version: string | null;
  groupId: string | null;
  usedOnTimestamp: string | null;
  expiryTimestamp: string | null;
  channel: string | null;
}

export interface SuperportDataUpdate {
  version?: string | null;
  label?: string | null;
  usedOnTimestamp?: string | null;
  createdOnTimestamp?: string | null;
  channel?: string | null;
  cryptoId?: string | null;
  connectionsPossible?: number | null;
}

export interface SuperportData extends SuperportDataUpdate {
  portId: string;
  version: string | null;
  label: string | null;
  usedOnTimestamp: string;
  createdOnTimestamp: string | null;
  channel: string | null;
  cryptoId: string | null;
  connectionsPossible: number | null;
}

export interface UnusedPortData {
  portId: string | null;
  remainingPorts: number;
}

export interface ReadPortData {
  portId: string;
  version: string;
  target: BundleTarget;
  name: string;
  description?: string | null;
  usedOnTimestamp: string;
  expiryTimestamp: string | null;
  channel: string | null;
  cryptoId?: string | null;
  permissionPresetId?: string | null;
}

export interface BundleBase {
  portId: string;
  version: string;
  org: string;
  target: BundleTarget;
  name: string;
}

export interface PortBundle extends BundleBase {
  portId: string;
  version: string;
  org: string;
  target: BundleTarget.direct;
  name: string;
  expiryTimestamp: string | null;
  rad: string;
  keyHash: string;
}

export interface DirectSuperportBundle extends BundleBase {
  portId: string;
  version: string;
  org: string;
  target: BundleTarget.superportDirect;
  name: string;
  rad: string;
  keyHash: string;
}

export interface GroupSuperportBundle extends BundleBase {}

export interface GroupBundle extends BundleBase {
  portId: string;
  version: string;
  org: string;
  target: BundleTarget.group;
  name: string;
  description?: string | null;
  expiryTimestamp: string | null;
}

export interface PendingCardInfo {
  portId: string;
  name: string;
  target: BundleTarget;
  usedOnTimestamp: string;
  expiryTimestamp: string | null;
  stage: 'Pending Handshake';
  channelDescription: string;
  table: PortTable;
}
