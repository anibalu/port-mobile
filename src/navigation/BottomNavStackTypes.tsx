import {FolderInfoWithUnread} from '@utils/Storage/folders';

export type BottomNavStackParamList = {
  Home: undefined;
  Superports: undefined;
  MyProfile: undefined;
  New: undefined;
  FolderStack: undefined;
};

export type FolderNavStackParamList = {
  FolderChats: {
    folder: FolderInfoWithUnread;
  };
  Folders: undefined;
};
