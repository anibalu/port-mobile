/**
 * Enum representing the promise resolve values of the sendMessage function.
 * @enum {number}
 */
export enum SendStatus {
  success,
  failed,
  journaled,
  undefined,
}
/**
 * Enum representing the promise resolve values of the receiveMessage function.
 * @enum {number}
 */
export enum ReceiveStatus {
  success,
  failed,
}
/**
 * Enum representing content types supported by the sendMessage and receiveMessage functions.
 * @enum {number}
 */
export enum ContentType {
  newChat, //independent from send and receive
  text, //send, receive handled
  name, //send, receive handled
  image, //send, receive handled
  video, //send, receive handled
  file, //send, receive handled
  displayImage, //send, receive handled
  handshakeA1, //send handled
  handshakeB2, //send handled
  info,
}
/**
 * Enum representing different message types.
 * @enum {number}
 */
export enum MessageType {
  new,
  forward,
  reply,
}
/**
 * Params needed to send messages for various content types.
 */
export interface SendTextParams {
  text: string;
}
export interface SendNameParams {
  name: string;
}
export interface SendFileParams {
  fileUri: string | null;
  fileName: string;
  fileType: string;
  mediaId?: string | null;
  key?: string | null;
  text?: string;
}
export interface SendImageParams extends SendFileParams {}
export interface SendVideoParams extends SendFileParams {}
export interface SendDisplayImageParams extends SendFileParams {}
export interface SendNewChatParams {}
export interface SendHandshakeA1Params {
  pubKey: string;
}
export interface SendHandshakeB2Params {
  pubKey: string;
  encryptedNonce: string;
}

/**
 * Params associated with a message sent or received.
 */
export interface SendMessageParams {
  messageId?: string;
  contentType: ContentType;
  data:
    | SendTextParams
    | SendNameParams
    | SendFileParams
    | SendImageParams
    | SendVideoParams
    | SendDisplayImageParams
    | SendNewChatParams
    | SendHandshakeA1Params
    | SendHandshakeB2Params
    | object;
  replyId?: string;
}
export interface SendMessageParamsStrict extends SendMessageParams {
  messageId: string;
}
/**
 * Params associated with a journaled message
 */
export interface JournaledMessageParams extends SendMessageParamsStrict {
  chatId: string;
}
/**
 * additional Params associated with a message saved to storage.
 */
export interface SavedMessageParams extends JournaledMessageParams {
  sender: boolean;
  memberId?: string;
  timestamp: string;
  sendStatus?: SendStatus;
}

export interface SendingMessageParams {
  chatId: string;
  messageId: string; //with sender prefix
}

export interface JournaledMessages {
  journal: JournaledMessageParams[];
}

export interface SendMessageOutput {
  sendStatus: SendStatus;
  message: SendMessageParams | SavedMessageParams | JournaledMessageParams;
}

export interface DownloadingMedia {
  media: string[];
}

export interface SendingMessages {
  sending: SendingMessageParams[];
}
