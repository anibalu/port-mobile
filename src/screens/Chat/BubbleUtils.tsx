import Read from '@assets/icons/statusIndicators/read.svg';
import Received from '@assets/icons/statusIndicators/received.svg';
import Sending from '@assets/icons/statusIndicators/sending.svg';
import Sent from '@assets/icons/statusIndicators/sent.svg';

import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {MessageStatus, SavedMessageParams} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {getTimeStamp} from '@utils/Time';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';

export function renderTimeStamp(
  message: SavedMessageParams,
  hasGradient?: boolean,
) {
  if (message.messageStatus === MessageStatus.failed) {
    return (
      <NumberlessText
        fontSizeType={FontSizeType.xs}
        fontType={FontType.md}
        style={styles.timeStampContainer}
        textColor={PortColors.text.delete}>
        Failed to send message
      </NumberlessText>
    );
  } else {
    return (
      <View style={styles.timeStampContainer}>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.rg}
          textColor={
            hasGradient
              ? PortColors.text.primaryWhite
              : message.sender
              ? PortColors.text.messageBubble.senderTimestamp
              : PortColors.text.messageBubble.receiverTimestamp
          }>
          {getTimeStamp(message.timestamp)}
        </NumberlessText>
        <View style={{marginLeft: 2, paddingBottom: 1.5}}>
          {message.sender &&
            (message.messageStatus === MessageStatus.delivered ? (
              <Received />
            ) : message.messageStatus === MessageStatus.sent ? (
              <Sent />
            ) : message.messageStatus === MessageStatus.read ? (
              <Read />
            ) : (
              <Sending />
            ))}
        </View>
      </View>
    );
  }
}

/**
 * Handles operations for when any media object is pressed in chat.
 * @param fileURI
 * @param onFailure
 */
export const handleMediaOpen = (
  fileURI: string | undefined | null,
  onUndefined: () => void,
  onError: () => void,
) => {
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

export function shouldRenderProfileName(memberName: string) {
  if (memberName === '') {
    return false;
  } else {
    return true;
  }
}

export function renderProfileName(
  shouldRender: boolean,
  name: string = DEFAULT_NAME,
  isSender: boolean,
  isReply: boolean,
  isOriginalSender?: boolean,
) {
  return shouldRender ? (
    isReply && isSender ? (
      <NumberlessText
        fontSizeType={FontSizeType.s}
        fontType={FontType.md}
        ellipsizeMode="tail"
        numberOfLines={1}
        textColor={
          isOriginalSender ? PortColors.text.title : PortColors.primary.black
        }>
        You
      </NumberlessText>
    ) : (
      <NumberlessText
        fontSizeType={FontSizeType.s}
        fontType={FontType.md}
        ellipsizeMode="tail"
        numberOfLines={1}
        textColor={
          isOriginalSender ? PortColors.text.title : PortColors.primary.black
        }>
        {name}
      </NumberlessText>
    )
  ) : isSender && isReply ? (
    <NumberlessText
      fontSizeType={FontSizeType.s}
      fontType={FontType.md}
      numberOfLines={1}
      ellipsizeMode="tail"
      textColor={PortColors.text.messageBubble.profileName}>
      You
    </NumberlessText>
  ) : (
    <View />
  );
}

export const MediaTextDisplay = ({
  text,
  message,
}: {
  text: string;
  message: SavedMessageParams;
}) => {
  return (
    <View style={getMediaTextAreaStyle(text)}>
      <NumberlessLinkText
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}
        numberOfLines={0}>
        {text}
      </NumberlessLinkText>
      {renderTimeStamp(message)}
    </View>
  );
};

const getMediaTextAreaStyle = (text: string) => {
  if (text.length > 27) {
    return styles.bubbleColumnContainer;
  } else {
    return styles.bubbleRowContainer;
  }
};

const styles = StyleSheet.create({
  timeStampContainer: {
    flexDirection: 'row',
    marginTop: 3,

    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },
  mediaReplyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bubbleColumnContainer: {
    paddingTop: 4,
    marginHorizontal: 6,
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'center',
    //Padding bottom is less, as item has additonal wrapping for it inside messageBubble.tsx
    paddingBottom: 6,
  },
  bubbleRowContainer: {
    paddingTop: 4,
    flexDirection: 'row',
    columnGap: 4,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    //Padding bottom is less, as item has additonal wrapping for it inside messageBubble.tsx
    paddingBottom: 6,
    marginHorizontal: 6,
  },
});
