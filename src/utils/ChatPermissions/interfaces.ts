export interface Permission {
  name: string;
  toggled: boolean;
}

export interface Permissions {
  notifications: Permission;
  displayPicture: Permission;
  autoDownload: Permission;
}
