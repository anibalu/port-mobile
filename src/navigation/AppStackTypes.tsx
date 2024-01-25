import {ConnectionInfo} from '@utils/Connections/interfaces';

export type AppStackParamList = {
  HomeTab: undefined;
  ConnectionCentre: undefined;
  MyProfile: undefined;
  ManageMembers: {groupId: string};
  AddMembers: {groupId: string};
  Scanner: undefined;
  EditAvatar: undefined;
  DirectChat: {
    chatId: string;
    isGroupChat: boolean;
    isConnected: boolean;
    profileUri: string | undefined | null;
  };
  ContactProfile: {chatId: string};
  Placeholder: undefined;
  ShareGroup: {groupId: string};
  ImageView: {imageURI: string; title: string};
  GroupOnboarding: undefined;
  NewGroup: {errorMessage: string};
  GroupProfile: {groupId: string};
  NewContact: {groupId: string};
  ViewPhotosVideos: {chatId: string};
  SharedMedia: {chatId: string};
  ViewFiles: {chatId: string};
  ForwardToContact: {
    messages: string[];
    setSelectedMessages: any;
    chatId: string;
    mediaOnly?: boolean;
  };
  ShareContact: {chatId: string};
  AddCategoryScreen: undefined;
  ReportIssueScreen: {
    category: string;
    sections: any[];
    Img: any;
  };
  SuggestAFeature: undefined;
  SelectShareContacts: {
    shareMessages: any[];
    isText?: boolean;
  };
  GalleryConfirmation: {
    selectedMembers: ConnectionInfo[];
    shareMessages: [];
    isChat?: boolean;
  };
  Presets: undefined;
  PendingRequests: undefined;
};
