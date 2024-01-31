import {PortBundle} from '@utils/Ports/interfaces';

/**
 * Enum representing the promise resolve values of the sendMessage function.
 * Modifying these when the app is live is not advised. It'd require migration of number values, which is why these enums are hardcoded.
 * MessageStatus < 0 need to be tracked by the UI actively.
 * @enum {number}
 */
export enum MessageStatus {
  // DO NOT MODIFY THESE NUMBERS. ADD STATUSES WITH EXTREME CAUTION!!!
  read = 1,
  delivered = 0,
  sent = -1,
  failed = -2,
  unassigned = -3,
  journaled = -32,
}
/**
 * Enum representing content types supported by the sendMessage and receiveMessage functions.
 * @enum {number}
 */
export enum ContentType {
  newChat = 0,
  text = 1,
  name = 2,
  image = 3,
  video = 4,
  file = 5,
  displayImage = 6,
  displayAvatar = 7,
  handshakeA1 = 8,
  handshakeB2 = 9,
  info = 10,
  contactBundle = 11,
  contactBundleRequest = 12,
  contactBundleResponse = 13,
  initialInfoRequest = 14,
  contactBundleDenialResponse = 15,
  deleted = 16,
  update = 17,
}

/**
 * Determines messages that need to send an acknowledgement on delivery.
 */
export const UpdateRequiredMessageContentTypes = [
  ContentType.text,
  ContentType.image,
  ContentType.file,
  ContentType.video,
];

export const LargeDataMessageContentTypes = [
  ContentType.image,
  ContentType.video,
  ContentType.file,
  ContentType.displayImage,
];
export const DisappearMessageExemptContentTypes = [
  ContentType.newChat,
  ContentType.displayAvatar,
  ContentType.handshakeA1,
  ContentType.handshakeB2,
  ContentType.info,
  ContentType.update,
  ContentType.contactBundle,
  ContentType.contactBundleRequest,
  ContentType.contactBundleResponse,
  ContentType.initialInfoRequest,
  ContentType.contactBundleDenialResponse,
];

export const SelectableMessageContentTypes = [
  ContentType.text,
  ContentType.image,
  ContentType.file,
  ContentType.video,
];

/**
 * Data interfaces corresponding to various content types.
 */
export type DataType =
  | null
  | TextParams
  | NameParams
  | LargeDataParams
  | FileParams
  | ImageParams
  | VideoParams
  | DisplayImageParams
  | HandshakeA1Params
  | HandshakeB2Params
  | InfoParams
  | ContactBundleParams
  | ContactBundleRequestParams
  | ContactBundleResponseParams
  | ContactBundleDenialResponseParams
  | InitialInfoRequestParams;

export interface TextParams {
  text: string;
}
export interface NameParams {
  name: string;
}
export interface DisplayAvatarParams {
  fileUri: string;
  fileName: string;
  fileType: 'avatar';
}
export interface LargeDataParams {
  fileUri: string | null;
  fileName: string;
  fileType: string;
  mediaId?: string | null;
  key?: string | null;
  text?: string;
  shouldDownload?: boolean;
  previewUri?: string | null;
}
export interface LargeDataParamsStrict extends LargeDataParams {
  fileUri: string;
}
export interface FileParams extends LargeDataParams {}
export interface ImageParams extends LargeDataParams {}
export interface VideoParams extends LargeDataParams {}
export interface DisplayImageParams extends LargeDataParams {}
export interface HandshakeA1Params {
  pubKey: string;
}
export interface HandshakeB2Params {
  pubKey: string;
  encryptedRad: string;
}
export interface InfoParams {
  info: string;
}
export interface ContactBundleParams extends PortBundle {
  accepted?: boolean;
  goToChatId?: string;
}

export interface ContactBundleRequestParams {
  destinationName?: string | null;
}
export interface ContactBundleResponseParams extends PortBundle {}

export interface ContactBundleDenialResponseParams {}

export interface UpdateParams {
  messageIdToBeUpdated: string;
  updatedMessageStatus: MessageStatus;
  deliveredAtTimestamp?: string;
  readAtTimestamp?: string;
}

export interface InitialInfoRequestParams {
  sendName: boolean;
  sendProfilePicture: boolean;
}

export type MessageDataTypeBasedOnContentType<T extends ContentType> =
  T extends ContentType.newChat
    ? null
    : T extends ContentType.text
    ? TextParams
    : T extends ContentType.name
    ? NameParams
    : T extends ContentType.image
    ? ImageParams
    : T extends ContentType.video
    ? VideoParams
    : T extends ContentType.file
    ? FileParams
    : T extends ContentType.displayAvatar
    ? DisplayAvatarParams
    : T extends ContentType.displayImage
    ? DisplayImageParams
    : T extends ContentType.handshakeA1
    ? HandshakeA1Params
    : T extends ContentType.handshakeB2
    ? HandshakeB2Params
    : T extends ContentType.info
    ? InfoParams
    : T extends ContentType.contactBundle
    ? ContactBundleParams
    : T extends ContentType.contactBundleRequest
    ? ContactBundleRequestParams
    : T extends ContentType.contactBundleResponse
    ? ContactBundleResponseParams
    : T extends ContentType.contactBundleDenialResponse
    ? ContactBundleDenialResponseParams
    : T extends ContentType.initialInfoRequest
    ? InitialInfoRequestParams
    : T extends ContentType.update
    ? UpdateParams
    : never;

/**
 * Params associated with a message saved to storage.
 */
export interface SavedMessageParams {
  chatId: string;
  messageId: string;
  contentType: ContentType;
  data: DataType;
  timestamp: string;
  sender: boolean; //true if user is sender. false if user is receiver
  messageStatus?: MessageStatus | null; //not null for sent messages
  replyId?: string | null; //not null if message is a reply message
  memberId?: string | null; //not null for received group messages
  expiresOn?: string | null; //when should the message expire.
}
/**
 * Interface describing the payload being encrypted and sent/received
 */
export interface PayloadMessageParams {
  messageId: string;
  contentType: ContentType;
  data: DataType;
  replyId?: string | null;
  expiresOn?: string | null; //when should the message expire.
}

export interface DownloadParams {
  mediaId: string;
  key: string;
}
