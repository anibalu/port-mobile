export interface Permission {
  name: string;
  toggled: boolean;
}

export interface Permissions {
  notifications: Permission;
  autoDownload: Permission;
  displayPicture?: Permission;
}
