import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {checkDateBoundary} from '@utils/Time';
import React, {ReactNode} from 'react';
import {FlatList} from 'react-native-bidirectional-infinite-scroll';
import MessageBubble from './MessageBubble';
import Group from '@utils/Groups/Group';
import DirectChat from '@utils/DirectChats/DirectChat';
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
  onStartReached,
  isGroupChat,
  dataHandler,
}: {
  messages: SavedMessageParams[];
  allowScrollToTop: boolean;
  selectedMessages: string[];
  onStartReached: any;
  handlePress: any;
  handleLongPress: any;
  isGroupChat: boolean;
  dataHandler: Group | DirectChat;
}): ReactNode {
  //render function to display message bubbles
  const renderMessage = ({
    item,
    index,
  }: {
    item: SavedMessageParams;
    index: number;
  }) => {
    if (
      item.data?.deleted ||
      item.contentType === ContentType.displayImage ||
      item.contentType === ContentType.contactBundleRequest ||
      item.contentType === ContentType.contactBundleResponse
    ) {
      return null;
    }
    //Checks if a date bubbled needs to be displayed.
    const isDateBoundary =
      index >= messages.length - 1
        ? true
        : checkDateBoundary(item.timestamp, messages[index + 1].timestamp);

    return (
      <MessageBubble
        message={item}
        isDateBoundary={isDateBoundary}
        selected={selectedMessages}
        handlePress={handlePress}
        handleLongPress={handleLongPress}
        isGroupChat={isGroupChat}
        dataHandler={dataHandler}
      />
    );
  };

  return (
    <FlatList
      data={messages}
      renderItem={renderMessage}
      inverted
      keyExtractor={message => message.messageId}
      enableAutoscrollToTop={allowScrollToTop}
      onStartReached={async () => {}}
      onEndReached={onStartReached}
    />
  );
}

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
