import {ChatType} from '@utils/Connections/interfaces';

/**
 * Permissions that take boolean values
 */
export interface BooleanPermissions {
  notifications?: boolean | null;
  autoDownload?: boolean | null;
  displayPicture?: boolean | null;
  contactSharing?: boolean | null;
  readReceipts?: boolean | null;
}
export const booleanKeysOfPermissions: (keyof BooleanPermissions)[] = [
  'notifications',
  'autoDownload',
  'displayPicture',
  'contactSharing',
  'readReceipts',
];

export interface PermissionsEntry extends PermissionsStrict {
  permissionsId: string;
}
/**
 * Permissions that take number values
 */
export interface NumberPermissions {
  disappearingMessages?: number | null;
}
export const numberKeysOfPermissions: (keyof NumberPermissions)[] = [
  'disappearingMessages',
];
/**
 * All permissions
 */
export interface Permissions extends BooleanPermissions, NumberPermissions {}

/**
 * Strict version of Permissions
 */
export interface PermissionsStrict extends Permissions {
  notifications: boolean;
  autoDownload: boolean;
  displayPicture: boolean;
  contactSharing: boolean;
  readReceipts: boolean;
  disappearingMessages: number;
}
export const masterPermissionsName = {
  notifications: 'Notifications',
  autoDownload: 'Media auto download',
  displayPicture: 'Display picture',
  contactSharing: 'Contact sharing',
  disappearingMessages: 'Disappearing messages',
  readReceipts: 'Read Receipts',
};

/**
 * All direct chat permissions. must be a subset of keys in the Permissions object.
 */
export interface BooleanDirectPermissions {
  notifications: boolean;
  autoDownload: boolean;
  displayPicture: boolean;
  contactSharing: boolean;
  readReceipts: boolean;
}
export interface NumberDirectPermissions {
  disappearingMessages: number;
}
export interface DirectPermissions extends PermissionsStrict {}
export const booleanKeysOfDirectPermissions: (keyof BooleanDirectPermissions)[] =
  [
    'notifications',
    'autoDownload',
    'displayPicture',
    'contactSharing',
    'readReceipts',
  ];
export const numberKeysOfDirectPermissions: (keyof NumberDirectPermissions)[] =
  ['disappearingMessages'];

/**
 * All group chat permissions. must be a subset of keys in the Permissions object.
 */
export interface BooleanGroupPermissions {
  notifications: boolean;
  autoDownload: boolean;
  displayPicture: boolean;
}
export interface NumberGroupPermissions {
  disappearingMessages: number;
}
interface GroupPermissionsInit extends Permissions {
  notifications: boolean;
  autoDownload: boolean;
  displayPicture: boolean;
  disappearingMessages: number;
}
export type GroupPermissions = Omit<GroupPermissionsInit, 'contactSharing'>;
export const booleanKeysOfGroupPermissions: (keyof BooleanGroupPermissions)[] =
  ['notifications', 'autoDownload', 'displayPicture'];
export const numberKeysOfGroupPermissions: (keyof NumberGroupPermissions)[] = [
  'disappearingMessages',
];

export type ChatPermissions<T extends ChatType> = T extends ChatType.direct
  ? DirectPermissions
  : T extends ChatType.group
  ? GroupPermissions
  : never;
