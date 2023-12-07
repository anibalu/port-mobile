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
    bundleId?: string;
  };
}

/**
 * Format of data stored locally when a bundle is generated.
 */
export interface GeneratedDirectConnectionBundle
  extends DirectConnectionBundle {
  keys: KeyPair;
  label?: string;
  requestedBy?: string;
}

export interface DirectSuperportConnectionBundle
  extends DirectConnectionBundle {
  data: {
    linkId: string;
    superportType: string;
    nonce?: string;
    pubkeyHash?: string;
  };
}
export interface GeneratedDirectSuperportConnectionBundle
  extends DirectSuperportConnectionBundle {
  keys: KeyPair;
  label?: string;
  lastUsed?: string;
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

export interface BundleMapEntry {
  bundleId: string;
  chatId: string;
}
