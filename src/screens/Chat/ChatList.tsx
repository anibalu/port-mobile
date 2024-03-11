import DownArrow from '@assets/icons/DownArrowWhite.svg';
import {PortColors} from '@components/ComponentUtils';
import {REACTION_SENDER_ID} from '@configs/constants';
import DirectChat from '@utils/DirectChats/DirectChat';
import Group from '@utils/Groups/Group';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {
  ContentType,
  MessageStatus,
  SavedMessageParams,
  UpdateRequiredMessageContentTypes,
} from '@utils/Messaging/interfaces';
import {checkDateBoundary, generateISOTimeStamp} from '@utils/Time';
import React, {ReactNode, useRef, useState} from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  ViewToken,
} from 'react-native';
import MessageBubble, {isDataMessage} from './MessageBubble';

//An item is considered viewed if it matches the following criteria.
const viewabilityConfig = {
  minimumViewTime: 1000,
  itemVisiblePercentThreshold: 60,
  waitForInteraction: false,
};

//Currently only sends read receipts for DMs
const sendReadReceipt = (chatId: string, message: SavedMessageParams) => {
  if (
    message.shouldAck &&
    !message.sender &&
    UpdateRequiredMessageContentTypes.includes(message.contentType)
  ) {
    //If message wasn't sent by us, it has to be delivered at the least and only then do we need to send an update.
    if (
      message.messageStatus != undefined &&
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

const handleReaction = async (
  message: SavedMessageParams,
  reaction: string,
) => {
  const sender = new SendMessage(message.chatId, ContentType.reaction, {
    chatId: message.chatId,
    messageId: message.messageId,
    //Since these are for DMs we will define an ID that identifies the sender locally.
    //Note that for the recevier, this flips and they themselves are the sender

    //This gets overridden inside sendGroup for passing in the member's own CryptoID.
    cryptoId: REACTION_SENDER_ID,
    reaction,
  });
  await sender.send();
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
  handleDownload,
  onStartReached,
  onEndReached,
  isGroupChat,
  onPostSelect,
  dataHandler,
  chatId,
  setReplyTo,
}: {
  messages: SavedMessageParams[];
  selectedMessages: string[];
  onStartReached: any;
  onEndReached: any;
  handlePress: any;
  handleLongPress: any;
  handleDownload: (x: string) => Promise<void>;
  isGroupChat: boolean;
  dataHandler: Group | DirectChat;
  chatId: string;
  onPostSelect: any;
  setReplyTo: Function;
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
    const shouldHaveExtraPadding =
      isDateBoundary || determineSpacing(item, messages[index + 1]);

    const onSwipe = () => {
      setSwiping(p => !p);
    };

    const onReaction = (message: SavedMessageParams, reaction: string) => {
      handleReaction(message, reaction);
      onPostSelect();
    };

    return (
      <MessageBubble
        chatId={chatId}
        toggleSwipe={onSwipe}
        message={item}
        hasExtraPadding={shouldHaveExtraPadding}
        isDateBoundary={isDateBoundary}
        selected={selectedMessages}
        handlePress={handlePress}
        handleReaction={onReaction}
        handleDownload={handleDownload}
        handleLongPress={handleLongPress}
        isGroupChat={isGroupChat}
        dataHandler={dataHandler}
        setReplyTo={setReplyTo}
      />
    );
  };
  const [swiping, setSwiping] = useState(false);

  //Swiping should be enabled for
  const minimumThreshold = (messages.length * 77) / 2;

  const onViewableItemsChanged = React.useCallback(
    ({changed}: {changed: ViewToken[]}) => {
      const visibleItems = changed.filter(entry => entry.isViewable);
      visibleItems.forEach(visible => {
        const message: SavedMessageParams = visible.item;
        sendReadReceipt(chatId, message);
        //If message wasn't sent by us, then it needs to be marked as read (We can't mark our own messages as read)
      });

      //We just need the item that was changed and added in.
    },

    [chatId],
  );

  const viewabilityConfigPairCallbacks = useRef([
    {viewabilityConfig, onViewableItemsChanged},
  ]);

  const [showScrollToEnd, setShowScrollToEnd] = useState(false);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (e.nativeEvent.contentOffset.y === 0) {
      // do things
      console.log('Start has been reached');
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

  // useEffect(() => {
  //   //If messages are < 12, then all messages are visible.
  //   if (messages.length < 12) {
  //     messages.forEach(msg => sendReadReceipt(chatId, msg));
  //     onEndReached();
  //   }
  //   //eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [messages]);

  return (
    <>
      <FlatList
        ref={flatlistRef}
        scrollEnabled={!swiping}
        data={messages}
        viewabilityConfigCallbackPairs={viewabilityConfigPairCallbacks.current}
        renderItem={renderMessage}
        inverted
        keyExtractor={message => message.messageId}
        maintainVisibleContentPosition={{
          minIndexForVisible: 1,
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

// export default memo(ChatList, (prevProps, nextProps) => {
//   return (
//     prevProps.messages.length === nextProps.messages.length &&
//     prevProps.selectedMessages.length === nextProps.selectedMessages.length &&
//     prevProps.isGroupChat === nextProps.isGroupChat &&
//     prevProps.dataHandler === nextProps.dataHandler &&
//     prevProps.chatId === nextProps.chatId
//   );
// });
