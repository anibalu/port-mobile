import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {MessageStatus, SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode, useEffect, useState} from 'react';
import {StyleSheet, View, Animated, Pressable} from 'react-native';
import {ContentBubble} from './ContentBubble';
import {ReplyBubble} from './ReplyBubble';
import {MAX_WIDTH} from './BubbleUtils';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Swipeable from './SwipeableCustom';
import Reply from '@assets/icons/reply.svg';
import {RenderReactionBar, RenderReactions} from './Reactions';
import {getReactionCounts, getRichReactions} from '@utils/Storage/reactions';
import {mediaContentTypes} from '@utils/Messaging/Send/SendDirectMessage/senders/MediaSender';
import {getMessage} from '@utils/Storage/messages';
import BubbleFocusOptions from './BubbleFocusOptions';
import {useChatContext} from '@screens/DirectChat/ChatContext';

export const MessageBubble = ({
  handleLongPress,
  message,
  swipeable = true,
}: {
  handleLongPress: any;
  message: SavedMessageParams;
  swipeable?: boolean;
}): ReactNode => {
  const {
    isConnected,
    setReaction,
    handlePress,
    isGroupChat,
    setReplyToMessage,
    optionBubblePosition,
  } = useChatContext();

  const [reactions, setReactions] = useState<any[]>([]);
  const [richReactions, setRichReactions] = useState<any>([]);

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
      setRichReactions(
        await getRichReactions(message.chatId, message.messageId),
      );
    }
  };

  useEffect(() => {
    updateSendStatus();
    updateMedia();
    fetchReactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.mtime, message.contentType]);

  //opens reactions bottom sheet
  const showReactionRibbon = () => {
    setReaction(message.messageId);
  };

  const options = {
    enableVibrateFallback: true /* iOS Only */,
    ignoreAndroidSystemSettings: true /* Android Only */,
  };

  function handleSwipe() {
    // Trigger haptic feedback
    ReactNativeHapticFeedback.trigger('impactMedium', options);
    setReplyToMessage(message);
  }

  const renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 75, 100],
      outputRange: [-24, 24, 30, 32],
    });
    return (
      <Animated.View
        style={[
          {width: 64, flexDirection: 'column', justifyContent: 'center'},
          {
            transform: [{translateX: trans}],
          },
        ]}>
        <Reply height={24} width={24} />
      </Animated.View>
    );
  };
  if (swipeable) {
    return (
      <Swipeable
        friction={2}
        leftThreshold={1000}
        leftTrigger={64}
        onSwipeableLeftTrigger={() => handleSwipe()}
        renderLeftActions={renderLeftActions}>
        <View
          style={
            message.sender
              ? {...styles.container, justifyContent: 'flex-end'}
              : {...styles.container, justifyContent: 'flex-start'}
          }>
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
                  ? PortColors.primary.sender
                  : PortColors.primary.white,
              }}>
              {message.replyId && (
                <View style={styles.replyContainer}>
                  <View
                    style={{
                      ...styles.replyBubbleContainer,
                      backgroundColor: message.sender
                        ? PortColors.primary.senderReply
                        : PortColors.background,
                    }}>
                    {/* Reply bubble goes here */}
                    <ReplyBubble message={message} isGroupChat={isGroupChat} />
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
            <View style={{}}>
              {reactions.length > 0 && (
                <RenderReactions
                  reactions={reactions}
                  showReactionRibbon={showReactionRibbon}
                />
              )}
            </View>
          </View>
        </View>
      </Swipeable>
    );
  } else {
    return (
      <View
        style={
          message.sender
            ? {...styles.container, justifyContent: 'flex-end'}
            : {...styles.container, justifyContent: 'flex-start'}
        }>
        {isGroupChat && !message.sender && <AvatarBox avatarSize="es" />}
        <View
          style={{
            flexDirection: 'column',
            alignItems: message.sender ? 'flex-end' : 'flex-start',
          }}>
          {isConnected && (
            <RenderReactionBar
              message={message}
              richReactions={richReactions}
            />
          )}
          <Pressable
            style={{
              ...styles.main,
              backgroundColor: message.sender
                ? PortColors.primary.sender
                : PortColors.primary.white,
            }}
            pointerEvents="box-only">
            {message.replyId && (
              <View style={styles.replyContainer}>
                <View
                  style={{
                    ...styles.replyBubbleContainer,
                    backgroundColor: message.sender
                      ? PortColors.primary.senderReply
                      : PortColors.background,
                  }}>
                  {/* Reply bubble goes here */}
                  <ReplyBubble message={message} isGroupChat={isGroupChat} />
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
          </Pressable>
          <Pressable style={{}} pointerEvents="box-only">
            {reactions.length > 0 && (
              <RenderReactions
                reactions={reactions}
                showReactionRibbon={showReactionRibbon}
              />
            )}
          </Pressable>
        </View>
        <View
          style={{
            position: 'absolute',
            alignSelf: message.sender ? 'flex-end' : 'flex-start',
            paddingHorizontal: PortSpacing.secondary.uniform,
            paddingTop: 2,
            top: optionBubblePosition,
          }}>
          <BubbleFocusOptions />
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: screen.width,
    paddingVertical: 2,
    paddingHorizontal: PortSpacing.secondary.uniform,
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
    borderRadius: 12,
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
