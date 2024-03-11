import React, {ReactNode, useEffect, useRef, useState} from 'react';

import DefaultImage from '@assets/avatars/avatar.png';

import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import DirectChat from '@utils/DirectChats/DirectChat';
import Group from '@utils/Groups/Group';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {
  ContentType,
  LargeDataMessageContentTypes,
  MessageStatus,
  SavedMessageParams,
  UpdateRequiredMessageContentTypes,
} from '@utils/Messaging/interfaces';
import {getGroupMessage, getMessage} from '@utils/Storage/messages';

import {createDateBoundaryStamp, generateISOTimeStamp} from '@utils/Time';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import ContactSharingBubble from './BubbleTypes/ContactSharingBubble';
import DataBubble from './BubbleTypes/DataBubble';
import FileBubble from './BubbleTypes/FileBubble';
import ImageBubble from './BubbleTypes/ImageBubble';
import InfoBubble from './BubbleTypes/InfoBubble';
import LinkPreviewBubble from './BubbleTypes/LinkPreviewBubble';
import ReplyBubble from './BubbleTypes/ReplyBubble';
import TextBubble from './BubbleTypes/TextBubble';
import VideoBubble from './BubbleTypes/VideoBubble';
import {reactionMapping} from '@configs/reactionmapping';
import {getReactionCounts, getRichReactions} from '@utils/Storage/reactions';
import {mediaContentTypes} from '@utils/Messaging/Send/SendDirectMessage/senders/MediaSender';

/**
 * Props that a message bubble takes
 */
interface MessageBubbleProps {
  message: SavedMessageParams;
  isDateBoundary: boolean;
  handleReaction: any;
  selected: string[];
  handlePress: any;
  hasExtraPadding: boolean;
  handleLongPress: any;
  isGroupChat: boolean;
  handleDownload: (x: string) => Promise<void>;
  dataHandler: Group | DirectChat;
  toggleSwipe: () => void;
  chatId: string;
  setReplyTo: Function;
}

const SWIPE_UPPER_THRESHOLD = screen.width / 5;

//Currently only sends read receipts for DMs
const sendReadReceipt = (chatId: string, message: SavedMessageParams) => {
  if (
    message.shouldAck &&
    !message.sender &&
    UpdateRequiredMessageContentTypes.includes(message.contentType)
  ) {
    console.log(`shouldAck: ${message.shouldAck}`);
    //If message wasn't sent by us, it has to be delivered at the least and only then do we need to send an update.
    if (
      message.messageStatus !== undefined &&
      message.messageStatus === MessageStatus.delivered
    ) {
      const sender = new SendMessage(chatId, ContentType.receipt, {
        messageId: message.messageId,
        readAt: generateISOTimeStamp(),
      });
      sender.send();
    }
  }
};

/**
 * Individual chat bubbles. Controls all paddings, blobs and wrappers for every type of bubble.
 * @param message
 * @param isDateBoundary , if message should have a date bubble before it.
 * @param selected
 * @param handlePress
 * @param handleLongPress
 * @param isGroupChat
 * @param dataHandler
 * @returns {ReactNode} bubble component
 */
const MessageBubble = ({
  message,
  isDateBoundary,
  selected,
  handlePress,
  handleReaction,
  handleDownload,
  hasExtraPadding,
  handleLongPress,
  isGroupChat,
  dataHandler,
  toggleSwipe,
  chatId,
  setReplyTo,
}: MessageBubbleProps): ReactNode => {
  const positionX = useRef(new Animated.Value(0)).current;

  const isLargeData = LargeDataMessageContentTypes.includes(
    message.contentType,
  );

  const [isReactionsVisible, setIsReactionsVisible] = useState(false);
  const [reactions, setReactions] = useState<any[]>([]);

  const onLongPress = (id: string) => {
    handleLongPress(id);
    if (selected.length > 1) {
      setIsReactionsVisible(false);
    } else {
      setIsReactionsVisible(true);
    }
  };

  useEffect(() => {
    if (selected.length > 1 || selected.length < 1) {
      setIsReactionsVisible(false);
    }
  }, [selected]);

  const fetchReactions = async () => {
    if (message.hasReaction) {
      const reactionCounts = await getReactionCounts(chatId, message.messageId);
      const reactions = [];
      for (let i = 0; i < reactionCounts.length; i++) {
        reactions.push([reactionCounts[i].reaction, reactionCounts[i].count]);
      }
      setReactions(reactions);
    }
  };

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

  /**
   * Tun this everytime a change to this message has been detected
   */
  useEffect(() => {
    updateSendStatus();
    updateMedia();
    fetchReactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.mtime]);

  const isReply = (message.replyId && message.replyId !== '') || false;

  const resetPosition = () => {
    Animated.spring(positionX, {
      toValue: 0,
      useNativeDriver: true,
      speed: 100,
    }).start();
    toggleSwipe();
  };

  const performReply = async (): Promise<void> => {
    setReplyTo(
      isGroupChat
        ? await getGroupMessage(chatId, message.messageId)
        : await getMessage(chatId, message.messageId),
    );
  };

  const constrainedX = positionX.interpolate({
    inputRange: [0, SWIPE_UPPER_THRESHOLD],
    outputRange: [0, SWIPE_UPPER_THRESHOLD],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      //Determines when the pan responder should take control of any gesture. Used to allow longpresses and taps to pass through.
      onMoveShouldSetPanResponder: (_, gesture) => {
        const absx = Math.abs(gesture.dx);
        const absy = Math.abs(gesture.dy);

        //If horizontal travel > vertical travel & travel distance > 10 px, then we need to consider it to be a reply gesture
        if (absx > absy && (absx > 10 || absy > 10)) {
          return true;
        }
        return false;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        toggleSwipe();
      },
      onPanResponderMove: Animated.event(
        [
          null,
          {
            dx: positionX,
          },
        ],
        {useNativeDriver: false},
      ),
      onPanResponderTerminate: () => {
        resetPosition();
      },
      onPanResponderRelease: (_, gesture) => {
        resetPosition();
        if (gesture.dx > 50) {
          performReply();
        }
      },
    }),
  ).current;

  const [intitialContainerType, initialBlobType] = initialStylePicker(
    message.contentType,
    hasExtraPadding,
    message.sender,
  );

  const [containerType] = useState(intitialContainerType);

  //Assume that member name is empty, which implies it is the sender themselves
  const [memberName, setMemberName] = useState('');

  useEffect(() => {
    (async () => {
      //If it is not a group chat, name doesnt need to be rendered which is why it is left as is
      if (isGroupChat) {
        //This checks if the message being rendered was sent by the user themselves.
        if (message.memberId) {
          const name = (
            await (dataHandler as Group).getMember(message.memberId)
          )?.name;
          setMemberName(name ? name : DEFAULT_NAME);
        }
      } else {
        if (message.replyId) {
          const name = (await (dataHandler as DirectChat).getChatData()).name;
          setMemberName(name ? name : DEFAULT_NAME);
        }
      }
    })();
    sendReadReceipt(chatId, message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Any kind of data bubble shouldn't be replied to
  if (!isSwipeableMessage(message.contentType)) {
    return (
      <View>
        {isDateBoundary
          ? renderDateBoundaryBubble(message, hasExtraPadding)
          : null}
        <View style={styles.parentContainer}>
          <View style={containerType}>
            <View style={initialBlobType}>
              {renderBubbleType(
                message,
                isGroupChat,
                handlePress,
                onLongPress,
                handleDownload,
                memberName,
                dataHandler,
                false,
              )}
            </View>
          </View>
        </View>
      </View>
    );
  } else {
    return (
      <View>
        {isDateBoundary
          ? renderDateBoundaryBubble(message, hasExtraPadding)
          : null}

        <Animated.View
          {...panResponder.panHandlers}
          style={{
            transform: [{translateX: constrainedX}],
          }}>
          <View
            style={StyleSheet.compose(
              styles.parentContainer,
              selected.includes(message.messageId) && {
                backgroundColor: 'rgba(0, 117, 224, 0.25)',
              },
            )}>
            <View style={containerType}>
              {/**
               * Profile image added if message is a received, non-data group message
               */}
              {isGroupChat && !message.sender && (
                <Image
                  source={{uri: chooseProfileURI()}}
                  style={styles.displayPicContainer}
                />
              )}

              {/*
              Controls rendering of the wrapper that contains information that is displayed by a bubble. Applies to all bubbles
               */}
              <View
                style={StyleSheet.compose(containerType, {
                  flexDirection: 'column',
                  flex: 1,
                  //We remove the padding from the container, as it already exists with the parent
                  marginRight: 0,
                  marginLeft: 0,
                  marginBottom: 0,
                })}>
                {isReactionsVisible &&
                  renderReactionBar(handleReaction, message)}
                <View
                  style={StyleSheet.compose(initialBlobType, {
                    paddingTop: isLargeData ? 4 : 8,
                    paddingHorizontal: isLargeData ? 4 : 8,
                    paddingBottom: isLargeData ? 2 : 8,
                  })}>
                  {renderBubbleType(
                    message,
                    isGroupChat,
                    handlePress,
                    onLongPress,
                    handleDownload,
                    memberName,
                    dataHandler,
                    isReply,
                  )}
                </View>
                {message.hasReaction
                  ? renderReactions(
                      reactions,
                      message.sender,
                      chatId,
                      message.messageId,
                    )
                  : null}
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }
};

/**
 * Responsible for identifies which content types are data messages.
 * @param contentType
 * @returns {boolean} - whether message is a data message
 */
export function isDataMessage(contentType: ContentType) {
  if (contentType === ContentType.name || contentType === ContentType.info) {
    return true;
  }
  return false;
}

export function isSwipeableMessage(contentType: ContentType) {
  if (
    contentType === ContentType.name ||
    contentType === ContentType.info ||
    contentType === ContentType.contactBundle
  ) {
    return false;
  }
  return true;
}

function renderReactionBar(
  handleReaction: (arg0: any, arg1: string) => void,
  message: SavedMessageParams,
) {
  return (
    <View
      style={StyleSheet.compose(styles.reactionSelection, {
        ...(message.sender ? {right: 0} : {}),
      })}>
      {reactionMapping.map(item => {
        return (
          <Pressable
            key={item}
            onPress={() => {
              handleReaction(message, item);
            }}>
            <NumberlessText
              fontSizeType={FontSizeType.es}
              fontType={FontType.rg}>
              {item}
            </NumberlessText>
          </Pressable>
        );
      })}
    </View>
  );
}

function renderReactions(
  reactions: any[],
  isSender: boolean,
  chatId: string = '',
  messageId: string = '',
) {
  return (
    <Pressable
      style={StyleSheet.compose(styles.reactionDisplay, {
        ...(isSender ? {right: 0} : {}),
      })}
      // TODO
      onPress={async () => {
        console.log(await getRichReactions(chatId, messageId));
      }}>
      {reactions.map(item => {
        if (item[1] > 0) {
          return (
            <NumberlessText
              key={item[0]}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              {item[0]} {item[1]}
            </NumberlessText>
          );
        }
      })}
    </Pressable>
  );
}

/**
 * Decides the styling of the container - data, sender or receiver container and blobs
 * It also adds padding to elements depending on their conditional render set by `hasExtraPadding`
 *
 * @param contentType - message content type
 * @param hasExtraPadding - notifies component about extra padding if any.
 * @param sender - whether message is sent by user
 * @returns {list} - styling
 */
function initialStylePicker(
  contentType: ContentType,
  hasExtraPadding: boolean,
  sender: boolean,
): StyleProp<ViewStyle>[] {
  if (isDataMessage(contentType)) {
    return [
      StyleSheet.compose(
        styles.DataContainer,
        hasExtraPadding ? styles.majorSpacing : styles.minorSpacing,
      ),
      styles.DataBlob,
    ];
  } else {
    switch (sender) {
      case true:
        return [
          StyleSheet.compose(
            styles.SenderContainer,
            hasExtraPadding ? styles.majorSpacing : styles.minorSpacing,
          ),
          styles.SenderBlob,
        ];
      case false:
        return [
          StyleSheet.compose(
            styles.ReceiverContainer,
            hasExtraPadding ? styles.majorSpacing : styles.minorSpacing,
          ),
          styles.ReceiverBlob,
        ];
    }
  }
}

/**
 * Renders timestamp for bubbles
 * @param message contains timestamp info
 * @returns {ReactNode} for the timestamp
 */
export const renderDateBoundaryBubble = (
  message: SavedMessageParams,
  hasExtraPadding: boolean,
): ReactNode => {
  return (
    <View style={styles.parentContainer}>
      <NumberlessText
        fontSizeType={FontSizeType.s}
        fontType={FontType.rg}
        style={StyleSheet.compose(
          styles.dateContainer,
          hasExtraPadding ? styles.majorSpacing : styles.minorSpacing,
        )}
        textColor={PortColors.text.messageBubble.dateBoundary}>
        {createDateBoundaryStamp(message.timestamp)}
      </NumberlessText>
    </View>
  );
};

/**
 * Responsible for displaying the right kind of message bubble for a message.
 * @param message
 * @param isGroup
 * @param handlePress
 * @param handleDownload
 * @param memberName
 * @param dataHandler
 * @returns the right kind of message bubble
 */
function renderBubbleType(
  message: SavedMessageParams,
  isGroup: boolean,
  handlePress: any,
  handleLongPress: any,
  handleDownload: (x: string) => Promise<void>,
  memberName: string = '',
  dataHandler: Group | DirectChat,
  isReply: boolean,
) {
  switch (message.contentType) {
    case ContentType.text: {
      if (isReply) {
        return (
          <ReplyBubble
            message={message}
            memberName={memberName}
            isGroup={isGroup}
            dataHandler={dataHandler}
            handlePress={handlePress}
            handleLongPress={handleLongPress}
          />
        );
      } else {
        return (
          <TextBubble
            message={message}
            memberName={memberName}
            handlePress={handlePress}
            handleLongPress={handleLongPress}
          />
        );
      }
    }
    case ContentType.image:
      return (
        <ImageBubble
          message={message}
          handleDownload={handleDownload}
          memberName={memberName}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );
    case ContentType.video:
      return (
        <VideoBubble
          message={message}
          handleDownload={handleDownload}
          memberName={memberName}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );
    case ContentType.link:
      return (
        <LinkPreviewBubble
          message={message}
          memberName={memberName}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );
    case ContentType.file:
      return (
        <FileBubble
          message={message}
          handleDownload={handleDownload}
          memberName={memberName}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
        />
      );
    case ContentType.info:
      return <InfoBubble {...message} />;
    case ContentType.contactBundle:
      return <ContactSharingBubble message={message} />;
    default:
      return <DataBubble {...message} />;
  }
}

function chooseProfileURI(imageUri: string = ''): string {
  if (imageUri !== undefined && imageUri !== '') {
    return `file://${imageUri}`;
  } else {
    return Image.resolveAssetSource(DefaultImage).uri;
  }
}

const styles = StyleSheet.create({
  //Styles the whole row of the chat tile.
  parentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '80%',
    borderRadius: 35,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  majorSpacing: {
    marginTop: 8,
  },
  minorSpacing: {
    marginTop: 0,
  },
  //If the bubble is sent by you
  SenderContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginRight: 16,
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginBottom: 4,
  },

  //If the bubble is received by you.
  ReceiverContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: 16,
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginBottom: 4,
  },

  //If bubble is for a data message
  DataContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignSelf: 'stretch',
    marginBottom: 4,
  },

  //Controls bubble style if sent by you
  SenderBlob: {
    backgroundColor: PortColors.primary.messageBubble.sender.blobBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    borderWidth: 0.5,
    borderColor: PortColors.primary.messageBubble.sender.blobBorder,
    maxWidth: '70%',
  },

  //Controls bubble style if received by you
  ReceiverBlob: {
    backgroundColor: PortColors.primary.messageBubble.receiver.blobBackground,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    borderWidth: 0.5,
    borderColor: PortColors.primary.messageBubble.receiver.blobBorder,
    maxWidth: '70%',
  },

  //Controls bubble style for any data bubble
  DataBlob: {
    backgroundColor: PortColors.primary.messageBubble.data.blobBackground,
    borderRadius: 16,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: PortColors.primary.messageBubble.data.blobBorder,
    maxWidth: '70%',
  },

  reactionSelection: {
    backgroundColor: PortColors.primary.white,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 5,
    padding: 5,
    zIndex: 20,
    bottom: 5,
    alignItems: 'center',
  },

  reactionDisplay: {
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 12,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: PortColors.primary.border.dullGrey,
    zIndex: 10,
    top: -4,
    paddingVertical: 2,
    paddingHorizontal: 7,
    gap: 4,
  },

  displayPicContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  displayPicParent: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});

export default MessageBubble;
