import {FolderInfo} from '@utils/ChatFolders/interfaces';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import {FileAttributes} from '@utils/Storage/interfaces';

export type AppStackParamList = {
  HomeTab: {selectedFolder?: FolderInfo};
  Superports: {name: string; avatar: FileAttributes};
  SuperportScreen: {
    portId?: string;
    name: string;
    avatar: FileAttributes;
    selectedFolder?: FolderInfo;
  };
  CreateFolder: {setSelectedFolder: any; portId?: string; chatId?: string};
  EditFolder: {selectedFolder: FolderInfo};
  MoveToFolder: {selectedFolder: FolderInfo};
  Scan: undefined;
  ConnectionCentre: undefined;
  MyProfile: {name: string; avatar: FileAttributes};
  ManageMembers: {groupId: string};
  AddMembers: {groupId: string};
  Scanner: undefined;
  DirectChat: {
    chatId: string;
    isConnected: boolean;
    profileUri: string | undefined | null;
    name?: string;
  };
  ContactProfile: {
    chatId: string;
    name: string;
    profileUri: string;
    permissionsId: string;
    isConnected: boolean;
  };
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
  SelectShareContacts: {
    shareMessages: any[];
    isText?: boolean;
  };
  GalleryConfirmation: {
    selectedMembers: ConnectionInfo[];
    shareMessages: any[];
    isChat?: boolean;
    fromShare?: boolean;
    isGroupChat?: boolean;
    fromCapture?: boolean;
    onRemove?: (item: any) => void;
  };
  CaptureMedia: {chatId: string; isGroupChat?: boolean};
  PendingRequests: undefined;
  Isolation: undefined;
  NewPortScreen: {name: string; avatar: FileAttributes};
  PreviewShareablePort: {
    qrData: string | null;
    linkData: string | null;
    title: string;
    profileUri: string;
  };
  CreateNewGroup: undefined;
  NewGroupPort: {groupId: string};
  GiveUsFeedbackScreen: undefined;
};
