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
  LargeDataParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {getMessage} from '@utils/Storage/messages';
import {createDateBoundaryStamp} from '@utils/Time';
import {
  Animated,
  Image,
  PanResponder,
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
  handleLongPress: any;
  isGroupChat: boolean;
  handleDownload: (x: string) => Promise<void>;
  dataHandler: Group | DirectChat;
  swipingCheck?: any;
  chatId: string;
  setReplyTo: Function;
}

const SWIPE_UPPER_THRESHOLD = screen.width / 5;

/**
 * Individual chat bubbles
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
  handleLongPress,
  isGroupChat,
  dataHandler,
  swipingCheck,
  chatId,
  setReplyTo,
}: MessageBubbleProps): ReactNode => {
  const positionX = useRef(new Animated.Value(0)).current;
  const scrollStopped = useRef(false);

  const resetPosition = () => {
    Animated.spring(positionX, {
      toValue: 0,
      useNativeDriver: true,
      speed: 100,
    }).start();
  };

  const performReply = async (): Promise<void> => {
    setReplyTo(await getMessage(chatId, message.messageId));
  };
  const enableScrollView = (isEnabled: boolean) => {
    if (scrollStopped.current !== isEnabled) {
      swipingCheck(isEnabled);
      scrollStopped.current = isEnabled;
    }
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
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const {dx, dy} = gestureState;
        return dx > 10 || dx < -10 || dy > 10 || dy < -10;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        enableScrollView(true);
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
      onPanResponderRelease: (_, gesture) => {
        resetPosition();
        if (gesture.dx > 100) {
          performReply();
        }
      },
    }),
  ).current;

  const [intitialContainerType, initialBlobType] = initialStylePicker(
    message.contentType,
    message.sender,
  );
  const [containerType] = useState(intitialContainerType);

  //Assume that member name is empty, which implies it is the sender themselves
  const [memberName, setMemberName] = useState('');
  const [blobType, setBlobType] = useState(initialBlobType);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected.includes(message.messageId)) {
      setBlobType(
        selectedMessageBackgroundStylePicker(
          message.contentType,
          message.sender,
        ),
      );
    } else {
      setBlobType(
        unselectedMessageBackgroundStylePicker(
          message.contentType,
          message.sender,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  //Any kind of data bubble shouldn't be replied to
  if (isDataMessage(message.contentType)) {
    return (
      <View style={styles.parentContainer}>
        {isDateBoundary ? renderTimestampBubble(message) : null}
        <View style={containerType}>
          <View style={blobType}>
            {renderBubbleType(
              message,
              isGroupChat,
              handlePress,
              handleLongPress,
              handleDownload,
              memberName,
              dataHandler,
            )}
          </View>
        </View>
      </View>
    );
  } else {
    return (
      <>
        {isDateBoundary ? renderTimestampBubble(message) : null}

        <Animated.View
          {...panResponder.panHandlers}
          style={{
            transform: [{translateX: constrainedX}],
            // position.getTranslateTransform(),
          }}>
          <View style={styles.parentContainer}>
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
              <View style={blobType}>
                {renderBubbleType(
                  message,
                  isGroupChat,
                  handlePress,
                  handleLongPress,
                  handleDownload,
                  memberName,
                  dataHandler,
                )}
              </View>
            </View>
          </View>
        </Animated.View>
      </>
    );
  }
};

/**
 * Responsible for identifies which content types are data messages.
 * @param contentType
 * @returns {boolean} - whether message is a data message
 */
function isDataMessage(contentType: ContentType) {
  if (contentType === ContentType.name || contentType === ContentType.info) {
    return true;
  }
  return false;
}

/**
 * Decides the styling of the container - data, sender or receiver container and blobs
 * @param contentType - message content type
 * @param sender - whether message is sent by user
 * @returns {list} - styling
 */
function initialStylePicker(
  contentType: ContentType,
  sender: boolean,
): ViewStyle[] {
  if (isDataMessage(contentType)) {
    return [styles.DataContainer, styles.DataBlob];
  } else {
    switch (sender) {
      case true:
        return [styles.SenderContainer, styles.SenderBlob];
      case false:
        return [styles.RecieverContainer, styles.ReceiverBlob];
    }
  }
}
function selectedMessageBackgroundStylePicker(
  contentType: ContentType,
  sender: boolean,
): ViewStyle {
  if (isDataMessage(contentType)) {
    return styles.DataBlob;
  }
  switch (sender) {
    case true:
      return styles.SenderSelectedBlob;
    case false:
      return styles.ReceiverSelectedBlob;
  }
}

function unselectedMessageBackgroundStylePicker(
  contentType: ContentType,
  sender: boolean,
): ViewStyle {
  if (isDataMessage(contentType)) {
    return styles.DataBlob;
  }
  switch (sender) {
    case true:
      return styles.SenderBlob;
    case false:
      return styles.ReceiverBlob;
  }
}

/**
 * Renders timestamp for bubbles
 * @param message contains timestamp info
 * @returns {ReactNode} for the timestamp
 */
const renderTimestampBubble = (message: SavedMessageParams): ReactNode => {
  return (
    <View style={styles.parentContainer}>
      <NumberlessText
        fontSizeType={FontSizeType.s}
        fontType={FontType.md}
        style={styles.dateContainer}
        textColor={PortColors.text.messageBubble.timestamp}>
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
 * @param handleLongPress
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
) {
  switch (message.contentType) {
    case ContentType.text: {
      if (message.replyId && message.replyId !== '') {
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
  parentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDEDED',
    maxWidth: '80%',
    overflow: 'hidden',
    borderRadius: 12,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 13,
  },
  dateStamp: {
    fontSize: 12,
    color: '#83868E',
    padding: 8,
  },
  SenderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    alignSelf: 'stretch',
    paddingRight: 5,
    paddingBottom: 3,
    paddingTop: 2,
  },
  RecieverContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    paddingLeft: 5,
    paddingBottom: 3,
    paddingTop: 2,
  },
  DataContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingBottom: 3,
    paddingTop: 2,
  },
  SenderBlob: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 6,
    borderWidth: 0.5,
    marginRight: 5,
    borderColor: '#E5E5E5',
    maxWidth: '70%',
  },
  ReceiverBlob: {
    backgroundColor: '#D4EBFF',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 6,
    borderWidth: 0.5,
    marginLeft: 5,
    borderColor: '#C5DDF1',
    maxWidth: '70%',
  },
  DataBlob: {
    backgroundColor: '#EFFEE0',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: 'flex-start',
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20,
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
    maxWidth: '70%',
  },
  SenderSelectedBlob: {
    backgroundColor: '#81C2FF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 6,
    borderWidth: 2,
    marginRight: 5,
    borderColor: '#547CEF',
    maxWidth: '70%',
  },
  ReceiverSelectedBlob: {
    backgroundColor: '#81C2FF',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 6,
    borderWidth: 2,
    marginLeft: 5,
    borderColor: '#547CEF',
    maxWidth: '70%',
  },
  text: {
    color: '#000000',
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
    prevProps.message.memberId === nextProps.message.memberId &&
    prevProps.isDateBoundary === nextProps.isDateBoundary
  );
});
