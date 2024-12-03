import {ChatType} from '@utils/Storage/DBCalls/connections';
import {FolderInfoWithUnread} from '@utils/Storage/folders';

export type BottomNavStackParamList = {
  Home:
    | undefined
    | {
        initialChatType: ChatType;
        chatData: any;
      };
  MyProfile: undefined;
  New: undefined;
  FolderStack: undefined;
  SuperportsStack: undefined;
};

export type FolderNavStackParamList = {
  FolderChats: {
    folder: FolderInfoWithUnread;
  };
  Folders: {initialFolder?: FolderInfoWithUnread};
};

export type SuperportsNavStackParamList = {
  Superports: undefined;
  SuperportsEducationScreen: undefined;
};
