import {PortSpacing, screen} from '@components/ComponentUtils';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {
  ContentType,
  MessageStatus,
  UnReplyableMessageContentTypes,
  UnSelectableMessageContentTypes,
} from '@utils/Messaging/interfaces';
import React, {ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View, Animated, Easing} from 'react-native';
import {ContentBubble} from './ContentBubble';
import {ReplyBubble} from './ReplyBubble';
import {MAX_WIDTH} from './BubbleUtils';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Swipeable from './SwipeableCustom';
import ReplyFilled from '@assets/icons/ReplyFilled.svg';
import {RenderReactions} from './Reactions';
import {getReactionCounts} from '@utils/Storage/reactions';
import {mediaContentTypes} from '@utils/Messaging/Send/SendDirectMessage/senders/MediaSender';
import {getMessage} from '@utils/Storage/messages';
import CheckBox from '@components/Reusable/MultiSelectMembers/CheckBox';
import DynamicColors from '@components/DynamicColors';
import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';
import {
  MessageSelectionMode,
  useSelectionContext,
} from '@screens/DirectChat/ChatContexts/SelectedMessages';
import {
  MessageBarActionType,
  useMessageBarActionsContext,
} from '@screens/DirectChat/ChatContexts/MessageBarActions';

const MessageBubbleContent = ({
  handleLongPress,
  handlePress,
  message,
  swipeable = true,
}: {
  handleLongPress: any;
  handlePress: Function;
  message: LoadedMessage;
  swipeable?: boolean;
}): ReactNode => {
  const {setRichReactionMessage} = useSelectionContext();
  // Because we're in the Direct chat component...
  const isGroupChat = false;

  const Colors = DynamicColors();

  const [reactions, setReactions] = useState<any[]>([]);

  const updateSendStatus = () => {
    if (message.deliveredTimestamp) {
      message.messageStatus = MessageStatus.delivered;
    }
    if (message.readTimestamp) {
      message.messageStatus = MessageStatus.read;
    }
  };

  const updateMedia = async () => {
    if (mediaContentTypes.includes(message.contentType)) {
      message.data =
        (await getMessage(message.chatId, message.messageId))?.data ||
        message.data;
    }
  };

  //fetches reactions from storage
  const fetchReactions = async () => {
    if (message.hasReaction) {
      const reactionCounts = await getReactionCounts(
        message.chatId,
        message.messageId,
      );
      const reactions = [];
      for (let i = 0; i < reactionCounts.length; i++) {
        reactions.push([reactionCounts[i].reaction, reactionCounts[i].count]);
      }
      setReactions(reactions);
    }
  };

  //opens reactions bottom sheet
  const showReactionRibbon = () => {
    setRichReactionMessage(message.messageId);
  };

  useEffect(() => {
    updateSendStatus();
    updateMedia();
    fetchReactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.mtime, message.contentType]);

  return (
    <>
      {isGroupChat && !message.sender && <AvatarBox avatarSize="es" />}
      <View
        style={{
          flexDirection: 'column',
          alignItems: message.sender ? 'flex-end' : 'flex-start',
        }}>
        <View
          style={{
            ...styles.main,
            backgroundColor: message.sender
              ? Colors.messagebubble.receiver
              : Colors.messagebubble.sender,
          }}
          pointerEvents={swipeable ? 'auto' : 'box-only'}>
          {message.reply.data && (
            <View style={styles.replyContainer}>
              <View
                style={{
                  ...styles.replyBubbleContainer,
                  backgroundColor: message.sender
                    ? Colors.messagebubble.replyBubbleInner
                    : Colors.messagebubble.replyBubbleReceive,
                }}>
                {/* Reply bubble goes here */}
                <ReplyBubble reply={message.reply} />
              </View>
            </View>
          )}
          <View style={styles.contentContainer}>
            <View style={styles.contentBubbleContainer}>
              {/* Content bubble goes here */}
              <ContentBubble
                message={message}
                handlePress={handlePress}
                handleLongPress={handleLongPress}
              />
            </View>
          </View>
        </View>
        {message.contentType !== ContentType.deleted && (
          <View pointerEvents={swipeable ? 'auto' : 'box-only'}>
            {reactions.length > 0 && (
              <RenderReactions
                reactions={reactions}
                showReactionRibbon={showReactionRibbon}
              />
            )}
          </View>
        )}
      </View>
    </>
  );
};

/**
 * This component is primarily responsible for swipe to reply and initiating message selection
 */
export const MessageBubble = ({
  handleLongPress,
  handlePress,
  message,
  selected,
  swipeable = true,
}: {
  handleLongPress: any;
  handlePress: Function;
  message: LoadedMessage;
  selected: boolean;
  swipeable?: boolean;
}): ReactNode => {
  // const {setReplyToMessage, selectionMode, selectedMessages} = useChatContext();
  const {selectionMode, selectedMessages} = useSelectionContext();

  const moveAnim = useRef(new Animated.Value(0)).current; // Starts from position 0
  // Function to trigger the movement
  const moveRight = () => {
    // Animated.timing is used to animate the value over time
    Animated.timing(moveAnim, {
      toValue: 40, // Move 100 units to the right
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  };
  const resetPosition = () => {
    // Animated.timing is used to animate the value over time
    Animated.timing(moveAnim, {
      toValue: 0, // Move 100 units to the right
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  };
  useMemo(() => {
    if (selectionMode === MessageSelectionMode.Multiple) {
      moveRight();
    } else {
      resetPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionMode]);

  const options = {
    enableVibrateFallback: true /* iOS Only */,
    ignoreAndroidSystemSettings: true /* Android Only */,
  };

  const {dispatchMessageBarAction} = useMessageBarActionsContext();
  function handleSwipe() {
    // Trigger haptic feedback
    ReactNativeHapticFeedback.trigger('impactMedium', options);
    if (!UnReplyableMessageContentTypes.includes(message.contentType)) {
      // setReplyToMessage(message);
      dispatchMessageBarAction({action: MessageBarActionType.Reply, message});
    }
  }

  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1], // Scale from 0.5 to 1 as you drag
      extrapolate: 'clamp', // Ensures that scaling doesn't go below 0 or above 1
    });

    return (
      <View style={{flexDirection: 'column', justifyContent: 'center'}}>
        <Animated.View
          style={[
            {
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 16,
              backgroundColor: '#0000000F',
              overflow: 'hidden',
            },
            {transform: [{scale}]},
          ]}>
          <ReplyFilled height={20} width={20} />
        </Animated.View>
      </View>
    );
  };

  // if (swipeable) {
  return React.useMemo(
    () =>
      swipeable ? (
        <>
          <Animated.View
            style={[
              {position: 'absolute', left: -40, alignSelf: 'center'},
              {transform: [{translateX: moveAnim}]},
            ]}>
            {!UnSelectableMessageContentTypes.includes(message.contentType) && (
              <CheckBox
                value={
                  selectionMode === MessageSelectionMode.Multiple && selected
                }
              />
            )}
          </Animated.View>
          <Swipeable
            enabled={!selectionMode}
            friction={2}
            leftThreshold={1000}
            leftTrigger={64}
            onSwipeableLeftTrigger={() => handleSwipe()}
            renderLeftActions={renderLeftActions}>
            <Animated.View
              style={
                message.sender
                  ? {...styles.container, justifyContent: 'flex-end'}
                  : [
                      {...styles.container, justifyContent: 'flex-start'},
                      {transform: [{translateX: moveAnim}]},
                    ]
              }>
              <MessageBubbleContent
                handleLongPress={handleLongPress}
                message={message}
                swipeable={swipeable}
                handlePress={handlePress}
              />
            </Animated.View>
          </Swipeable>
        </>
      ) : (
        <View
          style={
            message.sender
              ? {...styles.container, justifyContent: 'flex-end'}
              : {...styles.container, justifyContent: 'flex-start'}
          }>
          <MessageBubbleContent
            handleLongPress={handleLongPress}
            handlePress={handlePress}
            message={message}
            swipeable={swipeable}
          />
        </View>
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedMessages, selectionMode, message.mtime],
  );
  // } else {
  //   // TODO: figure out how anything falls into this block
  //   return (
  //     <View
  //       style={
  //         message.sender
  //           ? {...styles.container, justifyContent: 'flex-end'}
  //           : {...styles.container, justifyContent: 'flex-start'}
  //       }>
  //       <MessageBubbleContent
  //         handleLongPress={handleLongPress}
  //         handlePress={handlePress}
  //         message={message}
  //         swipeable={swipeable}
  //       />
  //     </View>
  //   );
  // }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: screen.width - PortSpacing.secondary.uniform,
    paddingVertical: 2,
    paddingRight: PortSpacing.secondary.right,
  },
  main: {
    maxWidth: MAX_WIDTH,
    borderRadius: PortSpacing.secondary.uniform,
    overflow: 'hidden',
  },
  replyContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  replyBubbleContainer: {
    overflow: 'hidden',
    borderRadius: 16,
    minHeight: PortSpacing.primary.uniform,
  },
  contentContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: 4,
  },
  contentBubbleContainer: {
    overflow: 'hidden',
  },
});
