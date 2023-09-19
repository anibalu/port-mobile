import {largeFile} from './LargeFiles';

/**
 * Type of content to render.
 */
export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  OTHER_FILE = 'file',
  HANDSHAKE = 'handshake', //used for key exchanges and other handshake
  NICKNAME = 'nickname',
}

/**
 * Content interface.
 * @param {boolean} sender Am I the sender?
 * @param {string} timestamp Message timestamp
 */
export interface Content {
  // True for sender, false for receiver,
  // undefined for data.
  sender?: boolean;
  timestamp: string;
}

/**
 * Extension of content for text bubbles
 * @param text -> string: Message text to display
 */
export interface TextContent extends Content {
  text: string;
}

/**
 * Extension of content for media bubbles
 * @param {string} mediaId ID of media to download. Becomes a filepath when media is downloaded.
 * @param {string} filePath Access token to download media. Once downloaded, no longer defined.
 * @param {string} mediaType Type of file, defined if downloaded.
 * @param {string} text Message caption, if message was sent with one
 * @param {number} size File size
 */
export interface MediaContent extends Content {
  mediaId?: string;
  filePath?: string;
  mediaType?: string;
  text?: string;
  size?: number;
  file?: largeFile;
  fileName?: string;
}
/**
 * Extension of content for nickname exchanges
 * @param {string} nickname
 */
export interface NicknameContent extends MediaContent {
  nickname: string;
}

/**
 * Top level interface to describe the content within a single message
 * @param {string} messageId ID of message
 * @param {string | ContentType} messageType Type of message. Union type for legacy reasons
 * @param {Content} data Content object defining content of message
 * @param {boolean} isDateBoundary Defines whether or not the message is to be rendered with a
 *                          date bubble if on a date boundary. Optional, since this is likely be
 *                          unnecessary most times.
 * @param {boolean} isSent Has the message sent successfully?
 */
export interface directMessageContent {
  messageId: string;
  messageType: string | ContentType;
  data: any;
  isDateBoundary?: boolean;
  isSent?: boolean;
  inFile?: boolean;
}
/**
 * Basic interface used for basic message journaling
 * @param {directMessageContent} message message data
 * @param {string} line the line the message belongs to
 */
export interface preparedMessage {
  message: directMessageContent;
  line: string;
}

/**
 * Old interface for message content, being refactored out
 * @param {string} messageType Type of message.
 * @param {string} messageId ID of message
 * @param {any} data Message data
 */
export interface messageContent {
  messageType: string; //nickname, multimedia, text, key, keyReply, etc
  messageId: string; //assigned by client
  data: any;
}
