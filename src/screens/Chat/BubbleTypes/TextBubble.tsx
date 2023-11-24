import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Sending from '../../../../assets/icons/sending.svg';
import {
  NumberlessMediumText,
  NumberlessRegularText,
} from '../../../components/NumberlessText';
import {DEFAULT_NAME} from '../../../configs/constants';
import {
  SavedMessageParams,
  SendStatus,
} from '../../../utils/Messaging/interfaces';
import {getTimeStamp} from '../../../utils/Time';

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
      onPress={() => handlePress(message.messageId)}
      onLongPress={() => handleLongPress(message.messageId)}>
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
      {!isReply && (
        <View style={styles.timeStampContainer}>
          {message.sendStatus === SendStatus.success || !message.sender ? (
            <View>
              <NumberlessRegularText style={styles.timeStamp}>
                {getTimeStamp(message.timestamp)}
              </NumberlessRegularText>
            </View>
          ) : (
            <View>
              {message.sendStatus === SendStatus.journaled ? (
                <View>
                  <Sending />
                </View>
              ) : (
                <View>
                  {true ? (
                    <View>
                      <Sending />
                    </View>
                  ) : (
                    <View>
                      <NumberlessRegularText style={styles.failedStamp}>
                        {'failed'}
                      </NumberlessRegularText>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
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
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  timeStamp: {
    fontSize: 10,
    color: '#868686',
  },
  failedStamp: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  text: {
    color: '#000000',
  },
});
