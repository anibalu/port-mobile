import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {
  ContentType,
  DisplayableContentTypes,
  InfoContentTypes,
  MessageStatus,
  SavedMessageParams,
  UpdateRequiredMessageContentTypes,
} from '@utils/Messaging/interfaces';
import {generateISOTimeStamp, getDateStamp} from '@utils/Time';
import React, {ReactNode, useEffect, useRef} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {MessageBubble} from './MessageBubble';
import {InfoBubble} from './InfoBubble';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

//Currently only sends read receipts for DMs
const sendReadReceipt = async (chatId: string, message: SavedMessageParams) => {
  if (
    message.shouldAck &&
    !message.sender &&
    UpdateRequiredMessageContentTypes.includes(message.contentType)
  ) {
    console.log(`shouldAck: ${message.shouldAck}`);
    //If message wasn't sent by us, it has to be delivered at the least and only then do we need to send an update.
    if (
      message.messageStatus !== undefined &&
      message.messageStatus === MessageStatus.delivered
    ) {
      const sender = new SendMessage(chatId, ContentType.receipt, {
        messageId: message.messageId,
        readAt: generateISOTimeStamp(),
      });
      sender.send();
    }
  }
};

//Decides if a date stamp should appear before a message bubble.
//If date stamp shouldn't appear, decides if additional padding needs to be added.
const MessagePrecursor = ({
  message,
  hasExtraPadding,
  isDateBoundary,
}: {
  message: SavedMessageParams;
  hasExtraPadding: boolean;
  isDateBoundary: boolean;
}): ReactNode => {
  return (
    <View style={styles.precursorContainer}>
      {isDateBoundary && (
        <View style={styles.dateContainer}>
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.md}
            textColor={PortColors.title}>
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
  message: SavedMessageParams;
  isDateBoundary: boolean;
  hasExtraPadding: boolean;
}): ReactNode => {
  const {
    chatId,
    selectedMessages,
    selectionMode,
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

  const isSelected = selectedMessages.includes(message.messageId);

  //responsible for sending read receipts
  useEffect(() => {
    sendReadReceipt(chatId, message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View>
      <MessagePrecursor
        message={message}
        isDateBoundary={isDateBoundary}
        hasExtraPadding={hasExtraPadding}
      />
      {DisplayableContentTypes.includes(message.contentType) && (
        <View style={styles.container}>
          {InfoContentTypes.includes(message.contentType) ? (
            <View
              style={{
                ...styles.messageBubbleContainer,
                justifyContent: 'center',
              }}>
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
              onPress={() =>
                handlePress(message.messageId, message.contentType)
              }
              onLongPress={() =>
                handleMessageBubbleLongPress(message.messageId)
              }
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
          <Pressable
            onPress={() => handlePress(message.messageId, message.contentType)}
            onLongPress={() => handleLongPress(message.messageId)}
            style={selectionMode && isSelected ? styles.overlay : styles.empty}
          />
        </View>
      )}
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
  },
  messageBubbleContainer: {
    width: screen.width,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  empty: {},
  overlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(78, 117, 255, 0.25)',
  },
});
