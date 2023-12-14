import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Sending from '@assets/icons/sending.svg';
import {
  NumberlessItalicText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {SavedMessageParams, SendStatus} from '@utils/Messaging/interfaces';
import {getTimeStamp} from '@utils/Time';
import {PortColors} from '@components/ComponentUtils';

export default function TextBubble({
  message,
  handlePress,
  handleLongPress,
  memberName,
  isReply = false,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  memberName: string;
  isReply?: boolean;
}) {
  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={() => {
        handlePress(message.messageId);
      }}
      onLongPress={() => {
        handleLongPress(message.messageId);
      }}>
      <View>
        {renderProfileName(
          shouldRenderProfileName(memberName),
          memberName,
          message.sender,
          isReply,
        )}
      </View>
      <NumberlessRegularText
        style={styles.text}
        numberOfLines={isReply ? 3 : 0}>
        {message.data.text || ''}
      </NumberlessRegularText>
      {!isReply && renderTimeStamp(message)}
    </Pressable>
  );
}

function renderTimeStamp(message: SavedMessageParams) {
  if (message.sendStatus === SendStatus.success || !message.sender) {
    return (
      <View style={styles.timeStampContainer}>
        <NumberlessRegularText style={styles.timeStamp}>
          {getTimeStamp(message.timestamp)}
        </NumberlessRegularText>
      </View>
    );
  } else if (message.sendStatus === SendStatus.failed) {
    return (
      <View style={styles.timeStampContainer}>
        <NumberlessItalicText style={styles.failedStamp}>
          failed
        </NumberlessItalicText>
      </View>
    );
  } else {
    return (
      <View style={styles.timeStampContainer}>
        <Sending />
      </View>
    );
  }
}

function shouldRenderProfileName(memberName: string) {
  if (memberName === '') {
    return false;
  } else {
    return true;
  }
}

function renderProfileName(
  shouldRender: boolean,
  name: string = DEFAULT_NAME,
  isSender: boolean,
  isReply: boolean,
) {
  return (
    <View>
      {shouldRender ? (
        <NumberlessMediumText>{name}</NumberlessMediumText>
      ) : isSender && isReply ? (
        <NumberlessMediumText>You</NumberlessMediumText>
      ) : (
        <View />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  timeStampContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  timeStamp: {
    fontSize: 10,
    color: PortColors.primary.grey.dark,
  },
  failedStamp: {
    fontSize: 10,
    color: PortColors.primary.grey.medium,
  },
  text: {
    color: '#000000',
  },
});
