import {FileAttributes} from '@utils/Storage/interfaces';

export interface ProfileInfo extends ProfileInfoUpdate {
  //name chosen by user
  name: string;
  //Id assigned by the server to client. this is not permanent and will change frequently.
  clientId: string;
  //user's private key for commmunication with server
  privateKey: string;
  //details of user's profile picture
  profilePicInfo: FileAttributes;
  //last backup time
  lastBackupTime: string;
}

export interface ProfileInfoUpdate {
  //name chosen by user
  name?: string;
  //Id assigned by the server to client. this is not permanent and will change frequently.
  clientId?: string;
  //user's private key for commmunication with server
  privateKey?: string;
  //details of user's profile picture
  profilePicInfo?: FileAttributes;
  //last backup time
  lastBackupTime: string;
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
}
