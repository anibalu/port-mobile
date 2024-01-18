import DirectChat from '@utils/DirectChats/DirectChat';
import Group from '@utils/Groups/Group';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {checkDateBoundary} from '@utils/Time';
import React, {ReactNode} from 'react';
import {FlatList} from 'react-native-bidirectional-infinite-scroll';
import MessageBubble from './MessageBubble';
import {toggleRead} from '@utils/Connections';
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
}): ReactNode {
  //render function to display message bubbles
  const renderMessage = ({
    item,
    index,
  }: {
    item: SavedMessageParams;
    index: number;
  }) => {
    //Putting this first skips all initialisation for the component, more efficient
    if (shouldNotRender(item.contentType)) {
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
        handleDownload={handleDownload}
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
      onStartReached={() => {
        toggleRead(chatId);
      }}
      onEndReached={onStartReached}
    />
  );
}

/**
 * Determines if nothing should be rendered. Is defined here to prevent any bubble state initialisation.
 * @param contentType - message content type
 */
function shouldNotRender(contentType: ContentType) {
  if (
    contentType === ContentType.handshakeA1 ||
    contentType === ContentType.handshakeB2 ||
    contentType === ContentType.newChat ||
    contentType === ContentType.displayImage ||
    contentType === ContentType.displayAvatar ||
    contentType === ContentType.contactBundleRequest ||
    contentType === ContentType.contactBundleDenialResponse ||
    contentType === ContentType.contactBundleResponse ||
    contentType === ContentType.initialInfoRequest
  ) {
    return true;
  } else {
    return false;
  }
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
