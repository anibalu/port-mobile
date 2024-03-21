export interface FolderInfo {
  folderId: string;
  name: string;
  permissionsId: string;
}

export interface FolderInfoWithUnread {
  folderId: string;
  name: string;
  permissionsId: string;
  unread: number;
}
