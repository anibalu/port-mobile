import {ChatType} from '@utils/Connections/interfaces';

/**
 * superset of all permissions.
 */
export interface BooleanPermissions {
  notifications?: boolean | null;
  autoDownload?: boolean | null;
  displayPicture?: boolean | null;
  contactSharing?: boolean | null;
}
export interface NumberPermissions {
  disappearingMessages?: number | null;
}

export interface Permissions extends BooleanPermissions, NumberPermissions {}
export const booleanKeysOfPermissions: (keyof BooleanPermissions)[] = [
  'notifications',
  'autoDownload',
  'displayPicture',
  'contactSharing',
];
export const numberKeysOfPermissions: (keyof NumberPermissions)[] = [
  'disappearingMessages',
];

export interface MasterPermissions extends Permissions {
  notifications: boolean;
  autoDownload: boolean;
  displayPicture: boolean;
  contactSharing: boolean;
  disappearingMessages: number;
}

export interface PermissionKeyDictionaryParams {
  key: keyof MasterPermissions;
  name: string;
}

export const masterPermissionsName = {
  notifications: 'Notifications',
  autoDownload: 'Media auto download',
  displayPicture: 'Display picture',
  contactSharing: 'Contact sharing',
  disappearingMessages: 'Disappearing messages',
};

/**
 * All direct chat permissions. must be a subset of keys in the Permissions object.
 */
export interface BooleanDirectPermissions {
  notifications: boolean;
  autoDownload: boolean;
  displayPicture: boolean;
  contactSharing: boolean;
}
export interface NumberDirectPermissions {
  disappearingMessages: number;
}
export interface DirectPermissions extends Permissions {
  notifications: boolean;
  autoDownload: boolean;
  displayPicture: boolean;
  contactSharing: boolean;
  disappearingMessages: number;
}
export const booleanKeysOfDirectPermissions: (keyof BooleanDirectPermissions)[] =
  ['notifications', 'autoDownload', 'displayPicture', 'contactSharing'];
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
