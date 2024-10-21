import {FolderInfoWithUnread} from '@utils/Storage/folders';

export type BottomNavStackParamList = {
  Home: undefined;
  MyProfile: undefined;
  New: undefined;
  FolderStack: undefined;
  SuperportsStack: undefined;
};

export type FolderNavStackParamList = {
  FolderChats: {
    folder: FolderInfoWithUnread;
  };
  Folders: undefined;
};

export type SuperportsNavStackParamList = {
  Superports: undefined;
  SuperportsEducationScreen: undefined;
};
