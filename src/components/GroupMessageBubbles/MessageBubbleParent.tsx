import {PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {InfoContentTypes} from '@utils/Messaging/interfaces';
import {getDateStamp} from '@utils/Time';
import React, {ReactNode, useRef} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {MessageBubble} from './MessageBubble';
import {InfoBubble} from './InfoBubble';
import {useChatContext} from '@screens/GroupChat/ChatContext';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import DynamicColors from '@components/DynamicColors';
import {LoadedGroupMessage} from '@utils/Storage/DBCalls/groupMessage';

//Decides if a date stamp should appear before a message bubble.
//If date stamp shouldn't appear, decides if additional padding needs to be added.
const MessagePrecursor = ({
  message,
  hasExtraPadding,
  isDateBoundary,
}: {
  message: LoadedGroupMessage;
  hasExtraPadding: boolean;
  isDateBoundary: boolean;
}): ReactNode => {
  const Colors = DynamicColors();
  return (
    <View style={styles.precursorContainer}>
      {isDateBoundary && (
        <View style={styles.dateContainer}>
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.md}
            textColor={Colors.text.primary}>
            {getDateStamp(message.timestamp)}
          </NumberlessText>
        </View>
      )}
      {hasExtraPadding && !isDateBoundary && (
        <View style={{width: screen.width, paddingVertical: 4}} />
      )}
    </View>
  );
};

export const MessageBubbleParent = ({
  message,
  isDateBoundary,
  hasExtraPadding,
}: {
  message: LoadedGroupMessage;
  isDateBoundary: boolean;
  hasExtraPadding: boolean;
}): ReactNode => {
  const {
    selectedMessages,
    handlePress,
    handleLongPress,
    onCleanCloseFocus,
    setSelectedMessage,
  } = useChatContext();

  const bubbleRef = useRef(null);

  //haptic feedback options
  const options = {
    enableVibrateFallback: true /* iOS Only */,
    ignoreAndroidSystemSettings: true /* Android Only */,
  };
  //understands where to focus the message bubble.
  const handleMessageBubbleLongPress = (messageId: any) => {
    if (selectedMessages.length <= 1 && bubbleRef.current) {
      try {
        bubbleRef.current.measure((x, y, width, height, pageX, pageY) => {
          setSelectedMessage({message, pageY, height});
          ReactNativeHapticFeedback.trigger('impactMedium', options);
          handleLongPress(messageId);
        });
      } catch (error) {
        console.log('Unable to measure: ', error);
        onCleanCloseFocus();
      }
    }
  };

  return (
    <View>
      <MessagePrecursor
        message={message}
        isDateBoundary={isDateBoundary}
        hasExtraPadding={hasExtraPadding}
      />
      <View style={styles.container}>
        {InfoContentTypes.includes(message.contentType) ? (
          <View style={styles.infoBubbleContainer}>
            <InfoBubble message={message} />
          </View>
        ) : (
          <Pressable
            ref={bubbleRef}
            style={
              message.sender
                ? {
                    ...styles.messageBubbleContainer,
                    justifyContent: 'flex-end',
                  }
                : styles.messageBubbleContainer
            }
            onPress={() => handlePress(message.messageId, message.contentType)}
            onLongPress={() => handleMessageBubbleLongPress(message.messageId)}
            delayLongPress={300}>
            <MessageBubble
              message={message}
              handleLongPress={() =>
                handleMessageBubbleLongPress(message.messageId)
              }
              swipeable={true}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  precursorContainer: {
    width: screen.width,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingVertical: PortSpacing.tertiary.uniform,
  },
  container: {
    width: screen.width,
    alignSelf: 'flex-end',
  },
  messageBubbleContainer: {
    width: screen.width - PortSpacing.secondary.left,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'flex-end',
  },
  infoBubbleContainer: {
    width: screen.width,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  empty: {},
  overlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(78, 117, 255, 0.25)',
  },
});
