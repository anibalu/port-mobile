import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {MessageStatus, SavedMessageParams} from '@utils/Messaging/interfaces';
import {PortSpacing, screen} from '@components/ComponentUtils';
import {getTimeStamp} from '@utils/Time';
import Sending from '@assets/icons/statusIndicators/sending.svg';
import DirectChat from '@utils/DirectChats/DirectChat';
import {handleAsyncMediaDownload as directMedia} from '@utils/Messaging/Receive/ReceiveDirect/HandleMediaDownload';
import FileViewer from 'react-native-file-viewer';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import store from '@store/appStore';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import DynamicColors from '@components/DynamicColors';

//max width of message bubble
export const MAX_WIDTH = screen.width - 2 * PortSpacing.secondary.uniform - 64;
//max width of content container inside messabe bubble
export const MAX_WIDTH_CONTENT = MAX_WIDTH - 8;
//max width of reply container inside messabe bubble
export const MAX_WIDTH_REPLY = MAX_WIDTH - 8;
//min width of reply container inside messabe bubble
export const MIN_WIDTH_REPLY = 100;
//height of file bubble
export const FILE_BUBBLE_HEIGHT = 66;
//width of media bubble inside media reply bubble
export const REPLY_MEDIA_WIDTH = 56;
//initial height of media bubble inside media reply bubble
export const REPLY_MEDIA_HEIGHT = 48;
//width of time stamp container
export const TIME_STAMP_WIDTH = 64;
//width of image or video bubble;
export const IMAGE_DIMENSIONS = MAX_WIDTH_CONTENT - PortSpacing.primary.uniform;

export const TIME_STAMP_TEXT_PADDING_SENDER = '                     ‎';
export const TIME_STAMP_TEXT_PADDING_RECEIVER = '                 ‎';

export const hasOnlyEmojis = (text: string): boolean => {
  if (text.length > 5) {
    return false;
  }
  if (text === '') {
    return false;
  }
  const emojiRegex =
    /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B06}\u{2934}\u{2935}\u{2B05}\u{25AA}\u{25AB}\u{25FE}\u{25FD}\u{25FB}\u{25FC}\u{25B6}\u{25C0}]*$/gu;

  const hasEmojis = emojiRegex.test(text);
  return hasEmojis;
};

export const getEmojiSize = (text: string): FontSizeType => {
  if (text.length === 2) {
    return FontSizeType.el;
  } else if (text.length === 4) {
    return FontSizeType.em;
  } else {
    return FontSizeType.es;
  }
};

export const getReplyBubbleName = async (
  reply: SavedMessageParams,
  isGroupChat: boolean,
) => {
  try {
    if (reply.sender) {
      return 'You';
    } else {
      if (isGroupChat) {
        return 'Group member';
      } else {
        const dataHandler = new DirectChat(reply.chatId);
        const name = (await dataHandler.getChatData()).name;
        return name;
      }
    }
  } catch (error) {
    console.log('Error fetching reply bubble name: ', error);
    return '';
  }
};

export const handleDownload = async (chatId: string, messageId: string) => {
  try {
    await directMedia(chatId, messageId);
    store.dispatch({
      type: 'PING',
      payload: 'PONG',
    });
  } catch (error) {
    console.error('Error downloading media: ', error);
  }
};

export const handleMediaOpen = (
  fileURI: string | undefined | null,
  onUndefined: () => void,
  onError: () => void,
) => {
  console.log('invoking file opener', getSafeAbsoluteURI(fileURI, 'doc'));
  if (fileURI != undefined && fileURI != null) {
    FileViewer.open(getSafeAbsoluteURI(fileURI, 'doc'), {
      showOpenWithDialog: true,
    }).catch(e => {
      console.log('Error opening file: ', e);
      onError();
    });
  } else {
    onUndefined();
  }
};

export const RenderTimeStamp = ({
  message,
  stampColor = 'rg',
  showReadReceipts = true,
}: {
  message: SavedMessageParams;
  stampColor?: 'rg' | 'w'; //regular or white
  showReadReceipts?: boolean;
}): ReactNode => {
  const svgArray = [
    {
      assetName: 'Read',
      light: require('@assets/light/icons/Read.svg').default,
      dark: require('@assets/dark/icons/Read.svg').default,
    },
    {
      assetName: 'Received',
      light: require('@assets/light/icons/Received.svg').default,
      dark: require('@assets/dark/icons/Received.svg').default,
    },
    {
      assetName: 'Sent',
      light: require('@assets/light/icons/Sent.svg').default,
      dark: require('@assets/icons/statusIndicators/sent.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const Read = results.Read;
  const Received = results.Received;
  const Sent = results.Sent;
  const Colors = DynamicColors();
  if (message.messageStatus === MessageStatus.failed) {
    return (
      <View style={styles.timestampContainer}>
        <NumberlessText
          style={{marginTop: 8}}
          fontSizeType={FontSizeType.xs}
          fontType={FontType.md}
          textColor={Colors.primary.red}>
          Failed to send message
        </NumberlessText>
      </View>
    );
  } else {
    return (
      <View style={styles.timestampContainer}>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.rg}
          textColor={
            stampColor === 'w' ? Colors.primary.darkgrey : Colors.text.subtitle
          }>
          {getTimeStamp(message.timestamp)}
        </NumberlessText>
        {showReadReceipts && message.sender && (
          <View style={{marginLeft: 3}}>
            {message.readTimestamp ? (
              <Read />
            ) : message.deliveredTimestamp ? (
              <Received />
            ) : message.messageStatus === MessageStatus.sent ? (
              <Sent />
            ) : (
              <Sending />
            )}
          </View>
        )}
      </View>
    );
  }
};

export const extractLink = (text: string): string | null => {
  const urlRegex: RegExp =
    /^(?:https?:\/\/)(?:www\.)?[\w.-]+\.[a-zA-Z]{2,}(?:\/\S*)?$/;
  const words = text.trim().split(/\s+|'/);
  for (const word of words) {
    if (urlRegex.test(word)) {
      return word;
    }
  }
  return null;
};

const styles = StyleSheet.create({
  timestampContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingLeft: PortSpacing.tertiary.left,
  },
});
