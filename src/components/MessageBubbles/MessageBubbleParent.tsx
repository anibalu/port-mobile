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
import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {MessageBubble} from './MessageBubble';
import {InfoBubble} from './InfoBubble';
import BlurViewModal from '@components/Reusable/BlurView/BlurView';
import {getGroupMessage, getMessage} from '@utils/Storage/messages';

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
  isDateBoundary,
  hasExtraPadding,
  onForward,
  onCopy,
  handlePress,
  chatId,
  handleLongPress,
  handleReaction,
  isGroupChat,
  selectedMessages,
  message,
  setReplyTo,
  setReaction,
  isConnected,
  selectionMode,
  setSelectionMode,
  clearSelection,
}: {
  isDateBoundary: boolean;
  hasExtraPadding: boolean;
  onForward: () => void;
  onCopy: () => void;
  handlePress: any;
  handleLongPress: any;
  chatId: string;
  handleReaction: any;
  isGroupChat: boolean;
  selectedMessages: string[];
  message: SavedMessageParams;
  setReplyTo: (x: SavedMessageParams | null) => void;
  setReaction: any;
  isConnected: boolean;
  selectionMode: boolean;
  setSelectionMode: (x: boolean) => void;
  clearSelection: any;
}): ReactNode => {
  //responsible for focusing a message
  const [focusVisible, setFocusVisible] = useState<boolean>(false);
  const DEFAULT_FOCUS_Y_POSITION = 125;
  const DEFAULT_OFFSET_X_POSITION = 100;
  const DEFAULT_BUBBLE_OPTIONS_HEIGHT = isConnected ? 271 : 218;
  const DEFAULT_REACTIONS_BAR_HEIGHT = isConnected ? 50 : 0;
  const [bubblePositionY, setBubblePositionY] = useState(
    DEFAULT_FOCUS_Y_POSITION,
  );
  const [optionBubblePosition, setOptionBubblePosition] = useState(
    DEFAULT_FOCUS_Y_POSITION,
  );
  const bubbleRef = useRef(null);
  //understands where to focus the message bubble and focuses the message bubble.
  const handleMessageBubbleLongPress = (messageId: any) => {
    if (selectedMessages.length <= 1 && bubbleRef.current) {
      handleLongPress(messageId);
      try {
        bubbleRef.current.measure((x, y, width, height, pageX, pageY) => {
          const availableHeight =
            screen.height -
            DEFAULT_OFFSET_X_POSITION -
            DEFAULT_FOCUS_Y_POSITION;
          const focusElementHeight =
            DEFAULT_REACTIONS_BAR_HEIGHT +
            height +
            DEFAULT_BUBBLE_OPTIONS_HEIGHT;
          setFocusVisible(true);
          if (pageY < DEFAULT_FOCUS_Y_POSITION) {
            setBubblePositionY(DEFAULT_FOCUS_Y_POSITION);
            if (focusElementHeight > availableHeight) {
              setOptionBubblePosition(
                availableHeight -
                  DEFAULT_REACTIONS_BAR_HEIGHT -
                  DEFAULT_BUBBLE_OPTIONS_HEIGHT,
              );
            } else {
              setOptionBubblePosition(height + DEFAULT_REACTIONS_BAR_HEIGHT);
            }
          } else {
            if (focusElementHeight > availableHeight) {
              setBubblePositionY(DEFAULT_FOCUS_Y_POSITION);
              setOptionBubblePosition(
                availableHeight -
                  DEFAULT_REACTIONS_BAR_HEIGHT -
                  DEFAULT_BUBBLE_OPTIONS_HEIGHT,
              );
            } else {
              setOptionBubblePosition(height + DEFAULT_REACTIONS_BAR_HEIGHT);
              if (
                screen.height - (pageY - DEFAULT_REACTIONS_BAR_HEIGHT) >
                focusElementHeight
              ) {
                setBubblePositionY(pageY - DEFAULT_REACTIONS_BAR_HEIGHT);
              } else {
                setBubblePositionY(
                  screen.height -
                    DEFAULT_OFFSET_X_POSITION -
                    focusElementHeight,
                );
              }
            }
          }
        });
      } catch (error) {
        console.log('Unable to measure: ', error);
      }
    }
  };

  const isSelected = selectedMessages.includes(message.messageId);

  const onCloseModal = () => {
    clearSelection();
    setFocusVisible(false);
  };

  const onSelect = () => {
    setSelectionMode(true);
    setFocusVisible(false);
  };

  const onDelete = () => {
    onSelect();
  };

  const performReply = async (): Promise<void> => {
    setFocusVisible(false);
    setReplyTo(
      isGroupChat
        ? await getGroupMessage(chatId, selectedMessages[0])
        : await getMessage(chatId, selectedMessages[0]),
    );
  };

  const onMsgCopy = () => {
    setFocusVisible(false);
    onCopy();
  };

  const onMsgForward = () => {
    setFocusVisible(false);
    onForward();
  };

  //responsible for sending read receipts
  useEffect(() => {
    sendReadReceipt(message.chatId, message);
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
              onPress={() => handlePress(message.messageId)}
              onLongPress={() =>
                handleMessageBubbleLongPress(message.messageId)
              }>
              <MessageBubble
                setFocusVisible={setFocusVisible}
                handlePress={handlePress}
                handleLongPress={handleMessageBubbleLongPress}
                isGroupChat={isGroupChat}
                message={message}
                setReplyTo={setReplyTo}
                setReaction={setReaction}
                isSelected={selectedMessages.length === 1 ? false : isSelected}
                selectedMessages={selectedMessages}
                isConnected={isConnected}
                handleReaction={handleReaction}
              />
              <BlurViewModal
                elementPositionY={bubblePositionY}
                visible={focusVisible}
                onClose={onCloseModal}>
                <MessageBubble
                  setFocusVisible={setFocusVisible}
                  handlePress={handlePress}
                  handleLongPress={handleMessageBubbleLongPress}
                  isGroupChat={isGroupChat}
                  message={message}
                  setReplyTo={setReplyTo}
                  setReaction={setReaction}
                  isSelected={true}
                  selectedMessages={selectedMessages}
                  isConnected={isConnected}
                  handleReaction={handleReaction}
                  swipeable={false}
                  onDelete={onDelete}
                  onReply={performReply}
                  onForward={onMsgForward}
                  onCopy={onMsgCopy}
                  onSelect={onSelect}
                  optionsBubblePosition={optionBubblePosition}
                />
              </BlurViewModal>
            </Pressable>
          )}
          <Pressable
            onPress={() => handlePress(message.messageId)}
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
