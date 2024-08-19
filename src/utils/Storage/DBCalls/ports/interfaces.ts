/**
 * Different tables used to store different kinds of port data.
 */
export enum PortTable {
  generated, //generated direct port data
  read, //read direct-port, group-port or superport data
  group, //generated group port data
  superport, //generated superport data
  contactPort, //read or generated contact port data
}

/**
 * Data returned when unused ports are requested from storage.
 */
export interface UnusedPortData {
  portId: string | null;
  remainingPorts: number;
}

/**
 * Different types of port bundles
 */
export enum BundleTarget {
  direct = 0,
  group = 1,
  superportDirect = 2,
  superportGroup = 3,
  contactPort = 4,
}
