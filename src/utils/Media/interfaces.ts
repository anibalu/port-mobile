import {ContentType} from '@utils/Messaging/interfaces';

export interface MediaEntry extends MediaUpdate {
  mediaId: string;
  createdOn: string;
  chatId?: string;
  messageId?: string;
}

export interface MediaUpdate {
  type: ContentType;
  filePath: string;
  name: string;
  previewPath?: string;
}
