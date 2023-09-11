import React from 'react';

import {Pressable, StyleSheet, View, ToastAndroid} from 'react-native';

import ImageBubble from './BubbleTypes/ImageBubble';
import FileBubble from './BubbleTypes/FileBubble';

import {directMessageContent, ContentType} from '../../utils/MessageInterface';
import TextBubble from './BubbleTypes/TextBubble';
import {NumberlessRegularText} from '../../components/NumberlessText';

/**
 * Selects and renders the appropriate chat bubble's content based on type.
 * @param type Type of bubble to render. Is currently a union type for legacy reasons.
 *             Will be refactored out in due time.
 * @param data Bubble data
 * @returns    Bubble component
 */
function renderBubbleType(props: {
  message: directMessageContent;
  lineId: string;
}) {
  switch (props.message.messageType) {
    case ContentType.TEXT:
      return <TextBubble {...props} />;
    case ContentType.IMAGE:
      return <ImageBubble {...props} />;
    case ContentType.OTHER_FILE:
      return <FileBubble {...props} />;
    case ContentType.NICKNAME:
      if (props.message.data.sender) {
        return (
          <NumberlessRegularText>
            Your Nickname securely sent
          </NumberlessRegularText>
        );
      } else {
        return (
          <NumberlessRegularText>
            Contact Nickname securely received
          </NumberlessRegularText>
        );
      }
    default:
      /**
       * @todo add styling properly
       */
      return (
        <NumberlessRegularText>
          Unrecognizable message type
        </NumberlessRegularText>
      );
  }
}

/**
 * Determines what styling to apply to the bubble based on the sender.
 * Undefined sender renders the bubble as a data bubble.
 * @param sender Are you the sender?
 * @returns      Tuple of styles for bubble to be rendered
 */
function stylePicker(sender?: boolean) {
  switch (sender) {
    case undefined:
      return [styles.DataContainer, styles.DataBlob];
    case true:
      return [styles.SenderContainer, styles.SenderBlob];
    case false:
      return [styles.RecieverContainer, styles.ReceiverBlob];
  }
}

/**
 * Handler for message long press. Will be fleshed out in the future.
 */
function longPress() {
  ToastAndroid.show('Message long pressed', ToastAndroid.LONG);
}

/**
 * Render a single chat bubble
 * @param props directMessageContent object containing all relevant message data
 * @param lineId line ID
 * @returns     A message bubble component
 */
export function DirectMessageBubble(props: {
  message: directMessageContent;
  lineId: string;
}) {
  let [container, blobStyle] = stylePicker();
  if (props.message.messageType === ContentType.TEXT) {
    [container, blobStyle] = stylePicker(props.message.data.sender);
  }
  if (props.message.messageType === ContentType.IMAGE) {
    [container, blobStyle] = stylePicker(props.message.data.sender);
  }
  if (props.message.messageType === ContentType.OTHER_FILE) {
    [container, blobStyle] = stylePicker(props.message.data.sender);
  }
  return (
    <View style={container}>
      <Pressable onLongPress={longPress} style={blobStyle}>
        {renderBubbleType(props)}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  SenderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
    paddingRight: 5,
    paddingBottom: 3,
    paddingTop: 2,
  },
  RecieverContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    width: '100%',
    paddingLeft: 5,
    paddingBottom: 3,
    paddingTop: 2,
  },
  DataContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 5,
    paddingRight: 10,
    borderWidth: 0.5,
    marginRight: 5,
    borderColor: '#E5E5E5',
    maxWidth: '70%',
    //minWidth: 60,
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
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 5,
    paddingRight: 10,
    borderWidth: 0.5,
    marginLeft: 5,
    borderColor: '#E5E5E5',
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
});
