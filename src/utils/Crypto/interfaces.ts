export interface CryptoData {
  privateKey?: string | null;
  publicKey?: string | null;
  sharedSecret?: string | null;
  peerPublicKeyHash?: string | null;
  rad?: string | null;
}

export interface CryptoDataStrict extends CryptoData {
  privateKey: string;
  publicKey: string;
  sharedSecret: string | null;
  peerPublicKeyHash: string | null;
  rad: string | null;
}
