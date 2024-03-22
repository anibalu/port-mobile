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
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {MessageBubble} from './MessageBubble';
import {InfoBubble} from './InfoBubble';

//Currently only sends read receipts for DMs
export const sendReadReceipt = async (
  chatId: string,
  message: SavedMessageParams,
) => {
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
  isDateBoundary,
  hasExtraPadding,
  handlePress,
  handleLongPress,
  handleReaction,
  isGroupChat,
  selectedMessages,
  message,
  setReplyTo,
  setReaction,
  isConnected,
}: {
  isDateBoundary: boolean;
  hasExtraPadding: boolean;
  handlePress: any;
  handleLongPress: any;
  handleReaction: any;
  isGroupChat: boolean;
  selectedMessages: string[];
  message: SavedMessageParams;
  setReplyTo: (x: SavedMessageParams) => void;
  setReaction: any;
  isConnected: boolean;
}): ReactNode => {
  const isSelected = selectedMessages.includes(message.messageId);
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
              style={
                message.sender
                  ? {
                      ...styles.messageBubbleContainer,
                      justifyContent: 'flex-end',
                    }
                  : styles.messageBubbleContainer
              }
              onPress={() => handlePress(message.messageId)}
              onLongPress={() => handleLongPress(message.messageId)}>
              <MessageBubble
                handlePress={handlePress}
                handleLongPress={handleLongPress}
                isGroupChat={isGroupChat}
                message={message}
                setReplyTo={setReplyTo}
                setReaction={setReaction}
                isSelected={isSelected}
                selectedMessages={selectedMessages}
                isConnected={isConnected}
                handleReaction={handleReaction}
              />
            </Pressable>
          )}
          <Pressable
            onPress={() => handlePress(message.messageId)}
            onLongPress={() => handleLongPress(message.messageId)}
            style={
              isSelected && selectedMessages.length > 1
                ? styles.overlay
                : styles.empty
            }
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
