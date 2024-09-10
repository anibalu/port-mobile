import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import {TemplateParams} from '@utils/Storage/DBCalls/templates';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import {LineDataCombined} from '@utils/DirectChats/DirectChat';
import {ContactEntry} from '@utils/Storage/DBCalls/contacts';

export type AppStackParamList = {
  HomeTab: undefined;
  PortContactList: undefined;
  PhoneContactList: undefined;
  SuperportScreen: {
    portId?: string;
    selectedFolder?: FolderInfo;
  };
  CreateFolder: {
    setSelectedFolder: any;
    portId?: string;
    chatId?: string;
    superportLabel?: string;
    saveDetails?: boolean;
    onSaveDetails?: (
      folderPermissions: PermissionsStrict,
      folderName: string,
    ) => void;
    savedFolderPermissions?: PermissionsStrict;
  };
  EditFolder: {selectedFolder: FolderInfo};
  MoveToFolder: {selectedFolder: FolderInfo};
  Scan: undefined;
  ConnectionCentre: undefined;
  Scanner: undefined;
  DirectChat: {
    chatId: string;
    isConnected: boolean;
    profileUri: string | undefined | null;
    name?: string;
    isAuthenticated: boolean;
    ifTemplateExists?: TemplateParams;
  };
  ChatProfile: {
    chatId: string;
    chatData: LineDataCombined;
  };
  ContactProfile: {
    contactInfo: ContactEntry;
    chatId: string | null;
    chatData: LineDataCombined | null;
  };
  Placeholder: undefined;
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
  NewPortScreen: {folder?: FolderInfo};
  PreviewShareablePort: {
    qrData: string | null;
    linkData: string | null;
    title: string;
    profilePicAttr: FileAttributes;
  };
  CreateNewGroup: undefined;
  NewGroupPort: {groupId: string};
  GiveUsFeedbackScreen: undefined;
  MediaViewer: {message: SavedMessageParams};
  BlockedContacts: undefined;
  HelpScreen: undefined;
  Templates: undefined;
};
