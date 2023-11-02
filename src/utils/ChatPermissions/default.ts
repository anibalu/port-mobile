import {Permissions} from './interfaces';

export const defaultPermissions: Permissions = {
  notifications: {
    name: 'Notifications',
    toggled: true,
  },
  displayPicture: {
    name: 'Display Picture',
    toggled: false,
  },
  autoDownload: {
    name: 'Media AutoDownload',
    toggled: true,
  },
};
