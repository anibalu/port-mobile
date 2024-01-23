import {toggleRead} from '@utils/Connections';
import DirectChat from '@utils/DirectChats/DirectChat';
import Group from '@utils/Groups/Group';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import {checkDateBoundary} from '@utils/Time';
import React, {ReactNode, useState} from 'react';
import {FlatList} from 'react-native-bidirectional-infinite-scroll';
import MessageBubble, {isDataMessage} from './MessageBubble';

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
  allowScrollToTop,
  selectedMessages,
  handlePress,
  handleLongPress,
  handleDownload,
  onStartReached,
  isGroupChat,
  dataHandler,
  chatId,
  setReplyTo,
}: {
  messages: SavedMessageParams[];
  allowScrollToTop: boolean;
  selectedMessages: string[];
  onStartReached: any;
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
        swipingCheck={onSwipe}
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

  return (
    <FlatList
      scrollEnabled={!swiping}
      data={messages}
      renderItem={renderMessage}
      inverted
      keyExtractor={message => message.messageId}
      enableAutoscrollToTop={allowScrollToTop}
      onStartReached={async () => {
        await toggleRead(chatId);
      }}
      onEndReached={onStartReached}
    />
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

// memo(ChatList, (prevProps, nextProps) => {
//   return (
//     prevProps.messages !== nextProps.messages &&
//     prevProps.selectedMessages === nextProps.selectedMessages &&
//     prevProps.groupInfo === nextProps.groupInfo &&
//     prevProps.isGroupChat === nextProps.isGroupChat &&
//     prevProps.allowScrollToTop === nextProps.allowScrollToTop
//   );
// });
