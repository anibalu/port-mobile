/**
 * Permissions that take boolean values
 */
export interface BooleanPermissions {
  notifications?: boolean | null;
  autoDownload?: boolean | null;
  displayPicture?: boolean | null;
  contactSharing?: boolean | null;
  readReceipts?: boolean | null;
  focus?: boolean | null;
  favourite?: boolean | null;
  calling?: boolean | null;
}
export const booleanKeysOfPermissions: (keyof BooleanPermissions)[] = [
  'notifications',
  'autoDownload',
  'displayPicture',
  'contactSharing',
  'readReceipts',
  'focus',
  'favourite',
  'calling',
];

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
  calling: boolean;
  disappearingMessages: number;
  focus: boolean;
  favourite: boolean;
}

/**
 * Storage requires all permissions to be set
 */
export interface PermissionsEntry extends PermissionsStrict {
  permissionsId: string;
}

export interface DirectPermissions extends PermissionsStrict {}

interface GroupPermissionsInit extends Permissions {
  notifications: boolean;
  autoDownload: boolean;
  displayPicture: boolean;
  disappearingMessages: number;
  focus: boolean;
  favourite: boolean;
}

export type GroupPermissions = Omit<GroupPermissionsInit, 'contactSharing' | 'calling'>;
