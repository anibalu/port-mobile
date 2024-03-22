import DownArrow from '@assets/icons/DownArrowWhite.svg';
import {PortColors} from '@components/ComponentUtils';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {checkDateBoundary, checkMessageTimeGap} from '@utils/Time';
import React, {ReactNode, useRef, useState} from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
} from 'react-native';
import {getRichReactions} from '@utils/Storage/reactions';
import {MessageBubbleParent} from '@components/MessageBubbles/MessageBubbleParent';

const MESSAGE_TIME_GAP_FOR_PADDING = 60 * 60 * 1000;

function isDataMessage(contentType: ContentType) {
  if (contentType === ContentType.name || contentType === ContentType.info) {
    return true;
  }
  return false;
}

const handleReaction = async (
  message: SavedMessageParams,
  reaction: string,
) => {
  const richReactionsData = await getRichReactions(
    message.chatId,
    message.messageId,
  );

  const selfReactionObj = richReactionsData.find(
    reaction => reaction.senderId === 'SELF',
  );

  const selfReaction = selfReactionObj ? selfReactionObj.reaction : false;

  if (selfReaction === reaction) {
    const sender = new SendMessage(message.chatId, ContentType.reaction, {
      chatId: message.chatId,
      messageId: message.messageId,
      reaction: '',
      tombstone: true,
    });
    await sender.send();
  } else {
    const sender = new SendMessage(message.chatId, ContentType.reaction, {
      chatId: message.chatId,
      messageId: message.messageId,
      //Since these are for DMs we will define an ID that identifies the sender locally.
      //Note that for the recevier, this flips and they themselves are the sender
      reaction,
    });
    await sender.send();
  }
};

/**
 * Renders an inverted flatlist that displays all chat messages.
 * @param messages - messages to be displayed
 * @param allowScrollToTop - allows autoscroll
 * @param selectedMessages - messages selected, if any
 * @param handlePress
 * @param handleLongPress
 * @param onStartReached - on reaching end of the message list
 * @param isGroupChat
 * @param groupInfo
 * @returns {ReactNode} flatlist that renders chat.
 */
function ChatList({
  messages,
  selectedMessages,
  handlePress,
  handleLongPress,
  onStartReached,
  onEndReached,
  isGroupChat,
  clearSelection,
  setReplyTo,
  setReaction,
  isConnected,
}: {
  messages: SavedMessageParams[];
  selectedMessages: string[];
  onStartReached: any;
  onEndReached: any;
  handlePress: any;
  handleLongPress: any;
  isGroupChat: boolean;
  clearSelection: () => void;
  setReplyTo: (x: SavedMessageParams) => void;
  setReaction: Function;
  isConnected: boolean;
}): ReactNode {
  //render function to display message bubbles
  const renderMessage = ({
    item,
    index,
  }: {
    item: SavedMessageParams;
    index: number;
  }) => {
    //Checks if a date bubbled needs to be displayed.
    const isDateBoundary =
      index >= messages.length - 1
        ? true
        : checkDateBoundary(item.timestamp, messages[index + 1].timestamp);

    //Should have spacing when: data bubble was previous, previous message was not own, timestamp is different
    // 1. senders change
    // 2. a certain time has elapsed
    const shouldHaveExtraPadding =
      isDateBoundary || determineSpacing(item, messages[index + 1]);

    const onReaction = (message: SavedMessageParams, reaction: string) => {
      handleReaction(message, reaction);
      clearSelection();
    };

    return (
      <MessageBubbleParent
        isDateBoundary={isDateBoundary}
        hasExtraPadding={shouldHaveExtraPadding}
        handlePress={handlePress}
        handleReaction={onReaction}
        handleLongPress={handleLongPress}
        isGroupChat={isGroupChat}
        selectedMessages={selectedMessages}
        message={item}
        setReplyTo={setReplyTo}
        setReaction={setReaction}
        isConnected={isConnected}
      />
    );
  };

  //Swiping should be enabled for
  const minimumThreshold = (messages.length * 77) / 2;

  const [showScrollToEnd, setShowScrollToEnd] = useState(false);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (e.nativeEvent.contentOffset.y === 0) {
      onEndReached();
    }
  };

  const flatlistRef = useRef<any>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (e.nativeEvent.contentOffset.y > 100) {
      setShowScrollToEnd(true);
    } else {
      setShowScrollToEnd(false);
    }
  };

  const onHandlePress = () => {
    if (flatlistRef.current) {
      flatlistRef.current.scrollToOffset({animated: true, offset: 0});
    }
  };

  return (
    <>
      <FlatList
        ref={flatlistRef}
        data={messages}
        renderItem={renderMessage}
        inverted
        keyExtractor={message => message.messageId}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: minimumThreshold,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={1000}
        onMomentumScrollEnd={handleMomentumEnd}
        onEndReached={onStartReached}
      />
      {showScrollToEnd && (
        <Pressable style={styles.handleStyle} onPress={onHandlePress}>
          <DownArrow width={20} height={20} />
        </Pressable>
      )}
    </>
  );
}

/**
 * Determines the padding between two messages, based on conditions defined by design. Adds margin to the TOP of every message tile ONLY.
 * @param message
 * @param nextMessage
 * @returns {boolean} whether spacing should be added
 */
const determineSpacing = (
  message: SavedMessageParams,
  nextMessage: SavedMessageParams,
): boolean => {
  if (
    isDataMessage(message.contentType) !==
    isDataMessage(nextMessage.contentType)
  ) {
    return true;
  } else if (message.sender !== nextMessage.sender) {
    //Comparing if the message and the next message don't have the same sender
    return true;
  } else if (
    checkMessageTimeGap(
      message.timestamp,
      nextMessage.timestamp,
      MESSAGE_TIME_GAP_FOR_PADDING,
    )
  ) {
    return true;
  } else {
    return false;
  }
};

const styles = StyleSheet.create({
  handleStyle: {
    height: 45,
    width: 45,
    position: 'absolute',
    bottom: 80,
    zIndex: 10,
    right: 0,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PortColors.primary.blue.app,
  },
});

export default ChatList;
