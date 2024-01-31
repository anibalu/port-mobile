import DownArrow from '@assets/icons/GreyArrowDown.svg';
import {PortColors} from '@components/ComponentUtils';
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

    return (
      <MessageBubble
        chatId={chatId}
        toggleSwipe={onSwipe}
        message={item}
        hasExtraPadding={shouldHaveExtraPadding}
        isDateBoundary={isDateBoundary}
        selected={selectedMessages}
        handlePress={handlePress}
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
      //We just need the item that was changed and added in.
      const message: SavedMessageParams = changed[0].item;

      //If message wasn't sent by us, then it needs to be marked as read (We can't mark our own messages as read)
      if (
        !message.sender &&
        UpdateRequiredMessageContentTypes.includes(message.contentType)
      ) {
        //If message wasn't sent by us, it has to be delivered at the least.
        if (
          message.messageStatus != undefined &&
          message.messageStatus === MessageStatus.delivered
        ) {
          const sender = new SendMessage(chatId, ContentType.update, {
            messageIdToBeUpdated: message.messageId,
            updatedMessageStatus: MessageStatus.read,
            readAtTimestamp: generateISOTimeStamp(),
          });
          sender.send();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const viewabilityConfigPairCallbacks = useRef([
    {viewabilityConfig, onViewableItemsChanged},
  ]);

  const [showScrollToEnd, setShowScrollToEnd] = useState(false);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (e.nativeEvent.contentOffset.y === 0) {
      // do things
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
        scrollEventThrottle={500}
        onMomentumScrollEnd={handleMomentumEnd}
        onEndReached={onStartReached}
      />
      {showScrollToEnd && (
        <Pressable style={styles.handleStyle} onPress={onHandlePress}>
          <DownArrow />
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

export default ChatList;

const styles = StyleSheet.create({
  handleStyle: {
    height: 50,
    width: 50,
    position: 'absolute',
    bottom: 70,
    zIndex: 10,
    right: 0,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PortColors.primary.blue.app,
  },
});

// memo(ChatList, (prevProps, nextProps) => {
//   return (
//     prevProps.messages !== nextProps.messages &&
//     prevProps.selectedMessages === nextProps.selectedMessages &&
//     prevProps.groupInfo === nextProps.groupInfo &&
//     prevProps.isGroupChat === nextProps.isGroupChat &&
//     prevProps.allowScrollToTop === nextProps.allowScrollToTop
//   );
// });
