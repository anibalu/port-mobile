import {ContentType, MessageStatus} from '../Messaging/interfaces';

export enum ChatType {
  direct,
  group,
}

export interface ConnectionInfoUpdate {
  chatId: string;
  connectionType?: ChatType;
  name?: string;
  text?: string | null;
  recentMessageType?: ContentType;
  pathToDisplayPic?: string | null;
  readStatus?: MessageStatus | null;
  authenticated?: boolean;
  timestamp?: string | null;
  newMessageCount?: number;
  disconnected?: boolean;
  latestMessageId?: string;
  folderId?: string;
}

export interface ConnectionInfo extends ConnectionInfoUpdate {
  chatId: string;
  connectionType: ChatType;
  name: string;
  text?: string | null;
  recentMessageType: ContentType;
  pathToDisplayPic?: string | null;
  readStatus: MessageStatus;
  authenticated: boolean;
  timestamp: string;
  newMessageCount: number;
  disconnected?: boolean;
  latestMessageId?: string;
  folderId: string;
}

export interface ConnectionInfoUpdateOnNewMessage extends ConnectionInfoUpdate {
  recentMessageType: ContentType;
  readStatus: MessageStatus;
}
