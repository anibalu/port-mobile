import {ContentType} from '../Messaging/interfaces';

export enum ChatType {
  direct,
  group,
}

export enum ReadStatus {
  new,
  read,
  sent,
  journaled,
  failed,
}
export interface ConnectionInfoUpdate {
  chatId: string;
  connectionType?: ChatType;
  name?: string;
  text?: string | null;
  recentMessageType?: ContentType;
  pathToDisplayPic?: string | null;
  readStatus?: ReadStatus;
  authenticated?: boolean;
  timestamp?: string;
  newMessageCount?: number;
  disconnected?: boolean;
  latestMessageId?: string;
}

export interface ConnectionInfo extends ConnectionInfoUpdate {
  chatId: string;
  connectionType: ChatType;
  name: string;
  text?: string | null;
  recentMessageType: ContentType;
  pathToDisplayPic?: string | null;
  readStatus: ReadStatus;
  authenticated: boolean;
  timestamp: string;
  newMessageCount: number;
  disconnected?: boolean;
  latestMessageId?: string;
}

export interface ConnectionInfoUpdateOnNewMessage extends ConnectionInfoUpdate {
  chatId: string;
  name?: string;
  text?: string;
  recentMessageType: ContentType;
  pathToDisplayPic?: string;
  readStatus: ReadStatus;
  authenticated?: boolean;
  latestMessageId?: string;
}

export interface Connections {
  connections: ConnectionInfo[];
}

export interface StoreConnection {
  chatId: string;
  stringifiedConnection: string;
  trigger?: string;
}

export interface StoreConnections {
  connections: StoreConnection[];
}
