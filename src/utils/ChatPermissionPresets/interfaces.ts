import {MasterPermissions} from '@utils/ChatPermissions/interfaces';

export interface PermissionPreset extends MasterPermissions {
  presetId: string;
  isDefault?: boolean;
  name: string;
}

export interface PermissionPresetUpdate {
  name?: string;
  notifications?: boolean;
  autoDownload?: boolean;
  displayPicture?: boolean;
  contactSharing?: boolean;
  disappearingMessages?: number;
  readReceipts?: boolean;
}
