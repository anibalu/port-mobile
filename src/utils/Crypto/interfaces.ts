export interface KeyPair {
  privKey: string;
  pubKey: string;
}

export interface SharedSecret {
  sharedSecret: string;
}

export interface ChatCrypto {
  nonce?: string;
  pubKeyHash?: string;
  peerPubKey?: string;
  privKey?: string;
  pubKey?: string;
  sharedSecret?: string;
}
