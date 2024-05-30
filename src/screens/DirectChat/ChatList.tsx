import DownArrow from '@assets/icons/navigation/WhiteAngleDown.svg';
import {PortSpacing} from '@components/ComponentUtils';
import {
  ContentType,
  DisplayableContentTypes,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {checkDateBoundary, checkMessageTimeGap} from '@utils/Time';
import React, {ReactNode, useRef, useState} from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {MessageBubbleParent} from '@components/MessageBubbles/MessageBubbleParent';
import {debouncedPeriodicOperations} from '@utils/AppOperations';
import {AuthenticatedStateBubble} from '@components/MessageBubbles/AuthenticatedStateBubble';
import DynamicColors from '@components/DynamicColors';

const MESSAGE_TIME_GAP_FOR_PADDING = 60 * 60 * 1000;

function isDataMessage(contentType: ContentType) {
  if (
    contentType === ContentType.name ||
    contentType === ContentType.info ||
    contentType === ContentType.disappearingMessages
  ) {
    return true;
  }
  return false;
}

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
  onStartReached,
  onEndReached,
}: {
  messages: SavedMessageParams[];
  onStartReached: any;
  onEndReached: any;
}): ReactNode {
  //render function to display message bubbles
  const renderMessage = ({
    item,
    index,
  }: {
    item: SavedMessageParams;
    index: number;
  }) => {
    const hasThereBeenNonHandshakeMessage = () => {
      const limit = messages.length > 8 ? 8 : messages.length;
      for (
        let index = messages.length - 1;
        index > messages.length - 1 - limit;
        index--
      ) {
        if (DisplayableContentTypes.includes(messages[index].contentType)) {
          return true;
        }
      }
      return false;
    };
    //Checks if a date bubbled needs to be displayed.
    const isDateBoundary =
      index === messages.length - 1
        ? hasThereBeenNonHandshakeMessage()
        : checkDateBoundary(item.timestamp, messages[index + 1].timestamp);

    //Should have spacing when: data bubble was previous, previous message was not own, timestamp is different
    // 1. senders change
    // 2. a certain time has elapsed
    const shouldHaveExtraPadding =
      isDateBoundary || determineSpacing(item, messages[index + 1]);

    return (
      <MessageBubbleParent
        message={item}
        isDateBoundary={isDateBoundary}
        hasExtraPadding={shouldHaveExtraPadding}
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
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const Colors = DynamicColors();
  const styles = styling(Colors);

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
        scrollEventThrottle={100}
        onMomentumScrollEnd={handleMomentumEnd}
        onEndReached={onStartReached}
        refreshing={refreshing}
        ListFooterComponent={<AuthenticatedStateBubble />}
        ListHeaderComponent={
          <View style={{height: PortSpacing.intermediate.bottom}} />
        }
        onRefresh={async () => {
          setRefreshing(true);
          await debouncedPeriodicOperations();
          setRefreshing(false);
        }}
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
  if (!DisplayableContentTypes.includes(message.contentType)) {
    return false;
  } else if (isDataMessage(message.contentType)) {
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

const styling = color =>
  StyleSheet.create({
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
      backgroundColor: color.primary.accent,
    },
  });

export default ChatList;
