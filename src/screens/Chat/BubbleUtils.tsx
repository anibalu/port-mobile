import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {MessageStatus, SavedMessageParams} from '@utils/Messaging/interfaces';
import {getTimeStamp} from '@utils/Time';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Sending from '@assets/icons/sending.svg';
import {DEFAULT_NAME} from '@configs/constants';

export function renderTimeStamp(message: SavedMessageParams) {
  if (message.messageStatus === MessageStatus.sent || !message.sender) {
    return (
      <NumberlessText
        fontSizeType={FontSizeType.xs}
        fontType={FontType.md}
        textColor={PortColors.text.messageBubble.timestamp}
        style={styles.timeStampContainer}>
        {getTimeStamp(message.timestamp)}
      </NumberlessText>
    );
  } else if (message.messageStatus === MessageStatus.failed) {
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
        <Sending />
      </View>
    );
  }
}

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
) {
  return (
    <View>
      {shouldRender ? (
        isReply ? (
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.sb}
            ellipsizeMode="tail"
            textColor={PortColors.text.messageBubble.profileName}>
            You
          </NumberlessText>
        ) : (
          <NumberlessText
            fontSizeType={FontSizeType.l}
            fontType={FontType.sb}
            ellipsizeMode="tail"
            textColor={PortColors.text.messageBubble.profileName}>
            {name}
          </NumberlessText>
        )
      ) : isSender && isReply ? (
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.sb}
          ellipsizeMode="tail"
          textColor={PortColors.text.messageBubble.profileName}>
          You
        </NumberlessText>
      ) : (
        <View />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timeStampContainer: {
    flexDirection: 'column',
    marginTop: 3,
    justifyContent: 'center',
  },
  failedStamp: {
    fontSize: 10,
    color: PortColors.primary.grey.medium,
  },
});
