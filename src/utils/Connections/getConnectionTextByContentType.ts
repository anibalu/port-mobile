/**
 * Generates a textual representation of the latest message based on its content type.
 *
 * @param {ContentType} contentType - The type of content of the latest message.
 * @param {Object} [latestMessage] - An optional object containing the data of the latest message.
 *
 * @returns {string} - A string representing the content of the latest message.
 *
 * The function handles various content types:
 * - For files, images, videos, audio recordings, and contact bundles, it returns an emoji with the associated text.
 * - For text and link content types, it returns the text if available.
 * - For disappearing messages, it indicates whether disappearing messages have been turned ON or OFF based on the timeout value.
 * - If the content type does not match any of the specified types or data is not provided, it returns an empty string.
 */

import {getLabelByTimeDiff} from '@utils/Time';
import {ContentType} from '@utils/Messaging/interfaces';

type ContentTypeEmojiAndText = {
  emoji?: string;
  defaultText: string;
  getText?: (latestMessageData: any) => string | undefined;
};

const contentTypeMap: {[key: number]: ContentTypeEmojiAndText} = {
  [ContentType.deleted]: {
    defaultText: 'This message was deleted',
    getText: (_latestMessageData: any) => 'This message was deleted',
  },
  [ContentType.file]: {
    emoji: '📎',
    defaultText: 'file',
  },
  [ContentType.image]: {
    emoji: '📷',
    defaultText: 'image',
  },
  [ContentType.video]: {
    emoji: '🎥',
    defaultText: 'video',
  },
  [ContentType.audioRecording]: {
    emoji: '🔊',
    defaultText: 'audio',
  },
  [ContentType.editedMessage]: {
    defaultText: '',
  },
  [ContentType.text]: {
    defaultText: '',
  },
  [ContentType.link]: {
    defaultText: '',
  },
  [ContentType.contactBundle]: {
    emoji: '👤',
    defaultText: '',
    getText: latestMessageData => latestMessageData?.bundle?.name,
  },
  [ContentType.contactBundleRequest]: {
    emoji: '👤',
    defaultText: 'contact has been requested',
  },
  [ContentType.contactBundleResponse]: {
    emoji: '👤',
    defaultText: '',
    getText: latestMessageData =>
      `shared your contact with ${latestMessageData?.bundle?.name}`,
  },
  [ContentType.disappearingMessages]: {
    defaultText: '',
    getText: latestMessageData => {
      if (latestMessageData?.timeoutValue) {
        const turnedOff =
          getLabelByTimeDiff(latestMessageData.timeoutValue) === 'Off';
        return turnedOff
          ? 'Disappearing messages have been turned OFF'
          : 'Disappearing messages have been turned ON';
      }
      return '';
    },
  },
};

const getConnectionTextByContentType = (
  contentType: ContentType,
  latestMessageData?: any,
): string => {
  if (!contentType) {
    return '';
  }
  const info = contentTypeMap[contentType];
  if (!info || !latestMessageData) {
    return '';
  }

  let text: string;
  if (info.getText) {
    text = info.getText(latestMessageData) || info.defaultText;
  } else {
    text = latestMessageData.text || info.defaultText;
  }

  return info.emoji ? `${info.emoji} ${text}` : text;
};

export default getConnectionTextByContentType;
