import Play from '@assets/icons/videoPlay.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode, useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {
  renderProfileName,
  renderTimeStamp,
  shouldRenderProfileName,
} from '../BubbleUtils';
import {SelectedMessagesSize} from '../Chat';
import VideoReplyContainer from '../ReplyContainers/VideoReplyContainer';
//import store from '@store/appStore';

export default function VideoBubble({
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
}): ReactNode {
  const [videoURI, setVideoURI] = useState<string | undefined>();
  useEffect(() => {
    if (message.data.fileUri) {
      setVideoURI('file://' + message.data.fileUri);
    }
  }, [message]);

  const handleLongPressFunction = (): void => {
    handleLongPress(message.messageId);
  };
  const handlePressFunction = (): void => {
    const selectedMessagesSize = handlePress(message.messageId);
    if (
      selectedMessagesSize === SelectedMessagesSize.empty &&
      videoURI != undefined
    ) {
      FileViewer.open(videoURI, {
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
        <VideoReplyContainer message={message} memberName={memberName} />
      ) : (
        <>
          {renderProfileName(
            shouldRenderProfileName(memberName),
            memberName,
            message.sender,
            isReply,
          )}

          <View style={styles.image}>
            <Play />
          </View>
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
    width: '100%',
  },
  image: {
    marginTop: 4,
    height: 0.7 * screen.width - 40, // Set the maximum height you desire
    width: 0.7 * screen.width - 40, // Set the maximum width you desire
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PortColors.primary.black,
  },
});
