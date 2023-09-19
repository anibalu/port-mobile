export interface permission {
  name: string;
  toggled: boolean;
}

export interface permissions {
  notifications: permission;
  displayPicture: permission;
}

//temporary, until default permissions settings option in UI is created
export const defaultPermissions: permissions = {
  notifications: {
    name: 'Notifications',
    toggled: true,
  },
  displayPicture: {
    name: 'Display Picture',
    toggled: true,
  },
};
