/**
 * Enum representing the promise resolve values of the sendMessage function.
 * Modifying these when the app is live is not advised. It'd require migration of number values, which is why these enums are hardcoded.
 * MessageStatus < 0 need to be tracked by the UI actively.
 * @enum {number}
 */
export enum MessageStatus {
  read = 1,
  delivered = 0,
  sent = -1,
  journaled = -2,
  failed = -3,
  unassigned = -4,
}
/**
 * Enum representing content types supported by the sendMessage and receiveMessage functions.
 * @enum {number}
 */
export enum ContentType {
  newChat,
  text,
  name,
  image,
  video,
  file,
  displayImage,
  displayAvatar,
  handshakeA1,
  handshakeB2,
  info,
  contactBundle,
  contactBundleRequest,
  contactBundleResponse,
}
export const LargeDataMessageContentTypes = [
  ContentType.image,
  ContentType.video,
  ContentType.file,
  ContentType.displayImage,
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
  | ContactBundleResponseParams;

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
  encryptedNonce: string;
}
export interface InfoParams {
  info: string;
}
export interface ContactBundleParams {
  bundle: string;
}
export interface ContactBundleRequestParams {
  bundleId: string;
}
export interface ContactBundleResponseParams {
  bundleId: string;
  bundle: string;
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
  messageStatus?: MessageStatus | number | null; //not null for sent messages
  replyId?: string | null; //not null if message is a reply message
  memberId?: string | null; //not null for received group messages
}
/**
 * Interface describing the payload being encrypted and sent/received
 */
export interface PayloadMessageParams {
  messageId: string;
  contentType: ContentType;
  data: DataType;
  replyId?: string | null;
}
/**
 * @deprecated
 * Enum representing the promise resolve values of the receiveMessage function.
 * @enum {number}
 */
export enum ReceiveStatus {
  success,
  failed,
}
/**
 * @deprecated
 * Params associated with a message sent or received.
 */
export interface SendMessageParams {
  messageId?: string;
  contentType: ContentType;
  data:
    | TextParams
    | NameParams
    | FileParams
    | ImageParams
    | VideoParams
    | DisplayImageParams
    | HandshakeA1Params
    | HandshakeB2Params
    | object;
  replyId?: string;
}
/**
 * @deprecated
 */
export interface SendMessageParamsStrict extends SendMessageParams {
  messageId: string;
}
/**
 * @deprecated
 * Params associated with a journaled message
 */
export interface JournaledMessageParams extends SendMessageParamsStrict {
  chatId: string;
}
/**
 * @deprecated
 */
export interface SendingMessageParams {
  chatId: string;
  messageId: string; //with sender prefix
}
/**
 * @deprecated
 */
export interface JournaledMessages {
  journal: JournaledMessageParams[];
}
/**
 * @deprecated
 */
export interface SendMessageOutput {
  sendStatus: MessageStatus;
  message: SendMessageParams | SavedMessageParams | JournaledMessageParams;
}
/**
 * @deprecated
 */
export interface DownloadingMedia {
  media: string[];
}
/**
 * @deprecated
 */
export interface SendingMessages {
  sending: SendingMessageParams[];
}
