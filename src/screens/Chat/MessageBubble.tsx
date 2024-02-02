import React, {ReactNode, memo, useEffect, useRef, useState} from 'react';

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
import {
  ContentType,
  LargeDataMessageContentTypes,
  LargeDataParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {getMessage} from '@utils/Storage/messages';
import {createDateBoundaryStamp} from '@utils/Time';
import {
  Animated,
  Image,
  PanResponder,
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
import ReplyBubble from './BubbleTypes/ReplyBubble';
import TextBubble from './BubbleTypes/TextBubble';
import VideoBubble from './BubbleTypes/VideoBubble';

/**
 * Props that a message bubble takes
 */
interface MessageBubbleProps {
  message: SavedMessageParams;
  isDateBoundary: boolean;
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
    setReplyTo(await getMessage(chatId, message.messageId));
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
    if (isGroupChat) {
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Any kind of data bubble shouldn't be replied to
  if (isDataMessage(message.contentType)) {
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
                handleLongPress,
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
                style={StyleSheet.compose(initialBlobType, {
                  paddingTop: isLargeData ? 4 : 8,
                  paddingHorizontal: isLargeData ? 4 : 8,
                  paddingBottom: isLargeData ? 2 : 8,
                })}>
                {renderBubbleType(
                  message,
                  isGroupChat,
                  handlePress,
                  handleLongPress,
                  handleDownload,
                  memberName,
                  dataHandler,
                  isReply,
                )}
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

export default memo(MessageBubble, (prevProps, nextProps) => {
  return (
    prevProps.message.messageStatus === nextProps.message.messageStatus &&
    (prevProps.message.data as LargeDataParams).fileUri ===
      (nextProps.message.data as LargeDataParams).fileUri &&
    (prevProps.message.data as LargeDataParams).previewUri ===
      (nextProps.message.data as LargeDataParams).previewUri &&
    prevProps.isGroupChat === nextProps.isGroupChat &&
    prevProps.selected === nextProps.selected &&
    prevProps.isDateBoundary === nextProps.isDateBoundary &&
    prevProps.hasExtraPadding === nextProps.hasExtraPadding
  );
});
