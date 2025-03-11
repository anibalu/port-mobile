import DownArrow from '@assets/icons/navigation/WhiteAngleDown.svg';
import {PortSpacing} from '@components/ComponentUtils';
import {
  ContentType,
  DisplayableContentTypes,
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
import {performDebouncedCommonAppOperations} from '@utils/AppOperations';
import DynamicColors from '@components/DynamicColors';
import {useChatContext} from './ChatContext';
import {MessageBubbleParent} from '@components/GroupMessageBubbles/MessageBubbleParent';
import {LoadedGroupMessage} from '@utils/Storage/DBCalls/groupMessage';
import {AuthenticatedStateBubble} from '@components/GroupMessageBubbles/AuthenticatedStateBubble';
import {useTheme} from 'src/context/ThemeContext';

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

const MemoizedMessageBubbleParent = React.memo(
  MessageBubbleParent,
  (prevProps, nextProps) => {
    return (
      prevProps.message.mtime === nextProps.message.mtime &&
      prevProps.message.contentType === nextProps.message.contentType
    );
  },
);
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
  messages: LoadedGroupMessage[];
  onStartReached: any;
  onEndReached: any;
}): ReactNode {
  //render function to display message bubbles
  const renderMessage = ({
    item,
    index,
  }: {
    item: LoadedGroupMessage;
    index: number;
  }) => {
    return (
      <MemoizedMessageBubbleParent
        message={item}
        isDateBoundary={
          index === messages.length - 1
            ? true
            : checkDateBoundary(item.timestamp, messages[index + 1].timestamp)
        }
        hasExtraPadding={
          (index === messages.length - 1
            ? true
            : checkDateBoundary(
                item.timestamp,
                messages[index + 1].timestamp,
              )) || determineSpacing(item, messages[index + 1])
        }
      />
    );
  };

  const [showScrollToEnd, setShowScrollToEnd] = useState(false);
  const {
    isPopUpVisible,
    togglePopUp,
    isEmojiSelectorVisible,
    setIsEmojiSelectorVisible,
  } = useChatContext();

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (e.nativeEvent.contentOffset.y === 0) {
      onEndReached();
    }
  };

  const flatlistRef = useRef<any>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (e.nativeEvent.contentOffset.y > 100) {
      // if pop up actions is visible
      // close component
      if (isPopUpVisible) {
        togglePopUp();
      }
      // if emoji keyboard is visible
      // close component
      if (isEmojiSelectorVisible) {
        setIsEmojiSelectorVisible(p => !p);
      }
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
  const {themeValue} = useTheme();
  const styles = styling(Colors, themeValue);

  return (
    <>
      <FlatList
        ref={flatlistRef}
        data={messages}
        renderItem={renderMessage}
        inverted
        keyExtractor={message => message.messageId}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        ListFooterComponent={<AuthenticatedStateBubble />}
        ListHeaderComponent={
          <View style={{height: PortSpacing.intermediate.bottom}} />
        }
        onMomentumScrollEnd={handleMomentumEnd}
        onEndReached={onStartReached}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await performDebouncedCommonAppOperations();
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
  message: LoadedGroupMessage,
  nextMessage: LoadedGroupMessage,
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

const styling = (color: any, themeValue: any) =>
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
      backgroundColor:
        themeValue === 'dark'
          ? color.messagebubble.sender
          : color.primary.accent,
    },
  });

export default ChatList;
