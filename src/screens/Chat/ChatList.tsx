import React from 'react';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import MessageBubble from './MessageBubble';
import {FlatList} from 'react-native';
import {checkDateBoundary} from '@utils/Time';

function ChatList({
  messages,
  flatList,
  selectedMessages,
  handlePress,
  handleLongPress,
  isGroupChat,
  groupInfo,
}: {
  messages: SavedMessageParams[];
  flatList: any;
  selectedMessages: string[];
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
    let isDateBoundary = false;
    if (index === 0) {
      isDateBoundary = true;
    } else {
      const previousItem = messages[index - 1];
      isDateBoundary = checkDateBoundary(
        item.timestamp,
        previousItem.timestamp,
      );
    }

    if (item.data?.deleted) {
      return <></>;
    }
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
      keyExtractor={message => message.messageId}
      ref={flatList}
      onContentSizeChange={() => {
        //initiates a scroll to the end when a new message is sent or recieved
        if (messages.length > 1) {
          flatList.current.scrollToEnd({animated: false});
        }
      }}
    />
  );
}

export default ChatList;
