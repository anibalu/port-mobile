import {ConnectionInfo} from '@utils/Connections/interfaces';

export type AppStackParamList = {
  HomeTab: undefined;
  ConnectionCentre: undefined;
  MyProfile: undefined;
  ManageMembers: {groupId: string};
  AddMembers: {groupId: string};
  Scanner: undefined;
  EditAvatar: undefined;
  DirectChat: {chatId: string};
  ContactProfile: {chatId: string};
  Placeholder: undefined;
  ShareGroup: {groupId: string};
  ImageView: {imageURI: string; title: string};
  GroupOnboarding: undefined;
  NewGroup: {errorMessage: string};
  GroupProfile: {groupId: string};
  NewContact: {groupId: string};
  NewSuperport: {superportId: string};
  SetupGroup: {
    groupName: string;
    groupDescription: string;
    displayPicPath: string | undefined;
  };
  ViewPhotosVideos: {chatId: string};
  ViewFiles: {chatId: string};
  ForwardToContact: {
    messages: string[];
    setSelectedMessages: any;
    chatId: string;
  };
  ShareContact: {chatId: string};
  AddCategoryScreen: undefined;
  ReportIssueScreen: {
    category: string;
    sections: any[];
    Img: any;
  };
  SuggestAFeature: undefined;
  ShareImage: {
    shareMessages: [];
  };
  GalleryConfirmation: {
    selectedMembers: ConnectionInfo[];
    shareMessages: [];
  };
};
