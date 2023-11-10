import {ConnectionType} from '../Connections/interfaces';
import {KeyPair} from '../Crypto/interfaces';

export interface ConnectionBundle {
  org: string;
  timestamp: string;
  connectionType: ConnectionType;
  version: string;
  data: any;
}

/**
 * Format of data shared over a direct connection mechanism (like QR)
 */
export interface DirectConnectionBundle extends ConnectionBundle {
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

/**
 * Format of data shared over a group connection mechanism (like QR)
 */
export interface GroupConnectionBundle extends ConnectionBundle {
  data: {
    linkId: string;
    name: string;
    description?: string;
  };
}
