import {Permissions} from './interfaces';

export const defaultDirectPermissions: Permissions = {
  notifications: {
    name: 'Notifications',
    toggled: true,
  },
  displayPicture: {
    name: 'Display Picture',
    toggled: true,
  },
  contactSharing: {
    name: 'Contact Sharing',
    toggled: true,
  },
  autoDownload: {
    name: 'Media AutoDownload',
    toggled: true,
  },
};

export const defaultGroupPermissions: Permissions = {
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
