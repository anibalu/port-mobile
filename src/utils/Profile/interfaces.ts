export interface ProfileInfo {
  //name chosen by user
  name: string;
  //Id assigned by the server to client. this is not permanent and will change frequently.
  clientId: string;
  //server's public key
  serverKey: string;
  //user's private key for commmunication with server
  privKey: string;
  //user's public key for communication with server
  pubKey: string;
  //shared secret generated using server's public key and user's private key
  sharedSecret: string;
}

export interface ProfileInfoUpdate {
  //name chosen by user
  name?: string;
  //Id assigned by the server to client. this is not permanent and will change frequently.
  clientId?: string;
  //server's public key
  serverKey?: string;
  //user's private key for commmunication with server
  privKey?: string;
  //user's public key for communication with server
  pubKey?: string;
  //shared secret generated using server's public key and user's private key
  sharedSecret?: string;
}

/**
 * If Profile has been created properly or not.
 */
export enum ProfileStatus {
  created,
  failed,
}

/**
 * part of the profile info that the server is responsible for generating.
 */
export interface ProfileServerGenerated {
  clientId: string;
  serverKey: string;
}
