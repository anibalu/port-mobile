import {KeyPair} from '../Crypto/interfaces';

/**
 * Format of data shared over a direct connection mechanism (like QR)
 */
export interface DirectConnectionBundle {
  org: string;
  timestamp: string;
  type: string; //port, superport or group
  version: string;
  data: {
    linkId: string;
    nonce?: string;
    pubkeyHash?: string;
  };
}

/**
 * Format of data stored locally when a bundle is generated.
 */
export interface GeneratedDirectConnectionBundle
  extends DirectConnectionBundle {
  keys: KeyPair;
  label?: string;
}

/**
 * Response to a bundle being read by a handshake function.
 */
export enum BundleReadResponse {
  formatError,
  networkError,
  success,
}

export interface DirectConnectionBundles {
  bundles: DirectConnectionBundle[];
}
