import {ChatType} from '@utils/Connections/interfaces';

/**
 * superset of all permissions.
 */

export interface Permissions {
  notifications?: boolean | null;
  autoDownload?: boolean | null;
  displayPicture?: boolean | null;
  contactSharing?: boolean | null;
}
export const keysOfPermissions: (keyof Permissions)[] = [
  'notifications',
  'autoDownload',
  'displayPicture',
  'contactSharing',
];

export interface MasterPermissions extends Permissions {
  notifications: boolean;
  autoDownload: boolean;
  displayPicture: boolean;
  contactSharing: boolean;
}

export interface PermissionKeyDictionaryParams {
  key: keyof MasterPermissions;
  name: string;
}

export const PermissionKeyDictionary: PermissionKeyDictionaryParams[] = [
  {key: 'notifications', name: 'Notifications'},
  {key: 'autoDownload', name: 'Media auto download'},
  {key: 'displayPicture', name: 'Display Picture'},
  {key: 'contactSharing', name: 'Contact Sharing'},
];

export const masterPermissionsName = {
  notifications: 'Notifications',
  autoDownload: 'Media auto download',
  displayPicture: 'Display Picture',
  contactSharing: 'Contact Sharing',
};

/**
 * All direct chat permissions. must be a subset of keys in the Permissions object.
 */
export interface DirectPermissions extends Permissions {
  notifications: boolean;
  autoDownload: boolean;
  displayPicture: boolean;
  contactSharing: boolean;
}
export const keysOfDirectPermissions: (keyof DirectPermissions)[] = [
  'notifications',
  'autoDownload',
  'displayPicture',
  'contactSharing',
];

/**
 * All group chat permissions. must be a subset of keys in the Permissions object.
 */
interface GroupPermissionsInit extends Permissions {
  notifications: boolean;
  autoDownload: boolean;
  displayPicture: boolean;
}
export type GroupPermissions = Omit<GroupPermissionsInit, 'contactSharing'>;
export const keysOfGroupPermissions: (keyof GroupPermissions)[] = [
  'notifications',
  'autoDownload',
  'displayPicture',
];

export type ChatPermissions<T extends ChatType> = T extends ChatType.direct
  ? DirectPermissions
  : T extends ChatType.group
  ? GroupPermissions
  : never;
