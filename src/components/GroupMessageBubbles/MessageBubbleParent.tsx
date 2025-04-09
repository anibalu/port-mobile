import React, {ReactNode, useRef} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {
  GroupMessageSelectionMode,
  useSelectionContext,
} from '@screens/GroupChat/ChatContexts/GroupSelectedMessages';

import {InfoContentTypes} from '@utils/Messaging/interfaces';
import {LoadedGroupMessage} from '@utils/Storage/DBCalls/groupMessage';
import {getDateStamp} from '@utils/Time';

import {InfoBubble} from './InfoBubble';
import {MessageBubble} from './MessageBubble';


//Decides if a date stamp should appear before a message bubble.
//If date stamp shouldn't appear, decides if additional padding needs to be added.
const MessagePrecursor = ({
  message,
  hasExtraPadding,
  isDateBoundary,
}: {
  message: LoadedGroupMessage;
  hasExtraPadding: boolean;
  isDateBoundary: boolean;
}): ReactNode => {
  const Colors = DynamicColors();
  return (
    <View style={styles.precursorContainer}>
      {isDateBoundary && (
        <View style={styles.dateContainer}>
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.md}
            textColor={Colors.text.primary}>
            {getDateStamp(message.timestamp)}
          </NumberlessText>
        </View>
      )}
      {hasExtraPadding && !isDateBoundary && (
        <View style={{width: screen.width, paddingVertical: 4}} />
      )}
    </View>
  );
};

export const MessageBubbleParent = ({
  message,
  isDateBoundary,
  hasExtraPadding,
}: {
  message: LoadedGroupMessage;
  isDateBoundary: boolean;
  hasExtraPadding: boolean;
}): ReactNode => {
  const {selectionMode, selectedMessages, toggleSelected} =
    useSelectionContext();

  const bubbleRef = useRef(null);

  const toggleSelectedWithMeasuredLayout = () => {
    bubbleRef.current.measure((_x, _y, _width, height, _pageX, pageY) => {
      toggleSelected(message, {
        height,
        y: pageY,
      });
    });
  };

  const handleMessageBubbleLongPress = () => {
    // Only do something if we're in single message selection mode
    if (GroupMessageSelectionMode.Single === selectionMode) {
      toggleSelectedWithMeasuredLayout();
    }
  };

  const handlePress = () => {
    // Only add or remove this message from the list of selected messages when clicked if
    // in multi select mode
    if (GroupMessageSelectionMode.Multiple !== selectionMode) {
      return false;
    }
    toggleSelectedWithMeasuredLayout();
    return true;
  };

  return (
    <View>
      <MessagePrecursor
        message={message}
        isDateBoundary={isDateBoundary}
        hasExtraPadding={hasExtraPadding}
      />
      <View style={styles.container}>
        {InfoContentTypes.includes(message.contentType) ? (
          <View style={styles.infoBubbleContainer}>
            <InfoBubble message={message} />
          </View>
        ) : (
          <Pressable
            ref={bubbleRef}
            style={
              message.sender
                ? {
                    ...styles.messageBubbleContainer,
                    justifyContent: 'flex-end',
                  }
                : styles.messageBubbleContainer
            }
            onPress={handlePress}
            onLongPress={handleMessageBubbleLongPress}
            delayLongPress={300}>
            <MessageBubble
              message={message}
              handleLongPress={handleMessageBubbleLongPress}
              selected={selectedMessages.some(
                m => m.messageId === message.messageId,
              )}
              swipeable={true}
              handlePress={handlePress}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  precursorContainer: {
    width: screen.width,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingVertical: PortSpacing.tertiary.uniform,
  },
  container: {
    width: screen.width,
    alignSelf: 'flex-end',
  },
  messageBubbleContainer: {
    width: screen.width - PortSpacing.secondary.left,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'flex-end',
  },
  infoBubbleContainer: {
    width: screen.width,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  empty: {},
  overlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(78, 117, 255, 0.25)',
  },
});
