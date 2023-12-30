import {screen} from '@components/ComponentUtils';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {
  renderProfileName,
  renderTimeStamp,
  shouldRenderProfileName,
} from '../BubbleUtils';
import {SelectedMessagesSize} from '../Chat';
import ImageReplyContainer from '../ReplyContainers/ImageReplyContainer';
//import store from '@store/appStore';

export default function ImageBubble({
  message,
  handlePress,
  handleLongPress,
  memberName,
  isReply = false,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  memberName: string;
  isReply?: boolean;
}) {
  const [messageURI, setMessageURI] = useState<string | undefined>();
  useEffect(() => {
    if (message.data.fileUri) {
      setMessageURI('file://' + message.data.fileUri);
    }
  }, [message]);

  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };
  const handlePressFunction = () => {
    const selectedMessagesSize = handlePress(message.messageId);
    if (
      selectedMessagesSize === SelectedMessagesSize.empty &&
      messageURI != undefined
    ) {
      FileViewer.open(messageURI, {
        showOpenWithDialog: true,
      });
    }
  };
  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={handlePressFunction}
      onLongPress={handleLongPressFunction}>
      {isReply ? (
        <ImageReplyContainer message={message} memberName={memberName} />
      ) : (
        <>
          {renderProfileName(
            shouldRenderProfileName(memberName),
            memberName,
            message.sender,
            isReply,
          )}

          {messageURI != undefined && (
            <Image source={{uri: messageURI}} style={styles.image} />
          )}
        </>
      )}
      {!isReply && renderTimeStamp(message)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  image: {
    height: 0.7 * screen.width - 40, // Set the maximum height you desire
    width: 0.7 * screen.width - 40, // Set the maximum width you desire
    borderRadius: 16,
  },
});
