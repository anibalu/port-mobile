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
