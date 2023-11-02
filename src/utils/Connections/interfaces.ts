import {Permissions} from '../ChatPermissions/interfaces';
import {ContentType} from '../Messaging/interfaces';

export enum ConnectionType {
  direct,
  group,
}

export enum ReadStatus {
  new = 'new',
  read = 'read',
  sent = 'sent',
  journaled = 'journaled',
}

export type ConnectionInfo = {
  chatId: string;
  connectionType: ConnectionType;
  name: string;
  permissions: Permissions;
  text?: string;
  recentMessageType: ContentType;
  pathToDisplayPic?: string;
  readStatus: ReadStatus;
  authenticated: boolean;
  timestamp: string;
  newMessageCount: number;
  disconnected?: boolean;
};

export type ConnectionInfoUpdate = {
  chatId: string;
  connectionType?: ConnectionType;
  name?: string;
  permissions?: Permissions;
  text?: string;
  recentMessageType?: ContentType;
  pathToDisplayPic?: string;
  readStatus?: ReadStatus;
  authenticated?: boolean;
  timestamp?: string;
  newMessageCount?: number;
  disconnected?: boolean;
};

export type ConnectionInfoUpdateOnNewMessage = {
  chatId: string;
  name?: string;
  permissions?: Permissions;
  text?: string;
  recentMessageType: ContentType;
  pathToDisplayPic?: string;
  readStatus: ReadStatus;
  authenticated?: boolean;
};

export interface Connections {
  connections: ConnectionInfo[];
}
