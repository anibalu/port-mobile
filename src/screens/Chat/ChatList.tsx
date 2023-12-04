import {SavedMessageParams} from '@utils/Messaging/interfaces';
import {checkDateBoundary} from '@utils/Time';
import React from 'react';
import {FlatList} from 'react-native-bidirectional-infinite-scroll';
import MessageBubble from './MessageBubble';

function ChatList({
  messages,
  allowScrollToTop,
  flatlistRef,
  selectedMessages,
  handlePress,
  handleLongPress,
  onStartReached,
  isGroupChat,
  groupInfo,
}: {
  messages: SavedMessageParams[];
  flatlistRef: any;
  allowScrollToTop: boolean;
  selectedMessages: string[];
  onStartReached: any;
  handlePress: any;
  handleLongPress: any;
  isGroupChat: boolean;
  groupInfo: any;
}) {
  //render function to display message bubbles
  const renderMessage = ({
    item,
    index,
  }: {
    item: SavedMessageParams;
    index: number;
  }) => {
    if (item.data?.deleted) {
      return null;
    }
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
        groupInfo={groupInfo}
      />
    );
  };

  return (
    <FlatList
      data={messages}
      renderItem={renderMessage}
      inverted
      ref={flatlistRef}
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
