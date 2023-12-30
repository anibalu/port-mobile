import File from '@assets/icons/FileClip.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
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
import FileReplyContainer from '../ReplyContainers/FileReplyContainer';

/**
 * @param message, message object
 * @param handlePress
 * @param handleLongPress
 * @param memberName
 * @param isReply, defaults to false, used to handle reply bubbles
 * @returns {ReactNode} file bubble component
 */
export default function FileBubble({
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
  const [fileURI, setFileURI] = useState<string | undefined>();
  useEffect(() => {
    if (message.data.fileUri) {
      setFileURI('file://' + message.data.fileUri);
    }
  }, [message]);
  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };
  const handlePressFunction = () => {
    const selectedMessagesSize = handlePress(message.messageId);
    if (
      selectedMessagesSize === SelectedMessagesSize.empty &&
      fileURI != undefined
    ) {
      FileViewer.open(fileURI, {
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
        <FileReplyContainer message={message} memberName={memberName} />
      ) : (
        <>
          {renderProfileName(
            shouldRenderProfileName(memberName),
            memberName,
            message.sender,
            isReply,
          )}

          <View style={styles.fileBox}>
            <View style={styles.fileClip}>
              <File />
            </View>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              style={{
                marginHorizontal: 10,
                width: 0.7 * screen.width - 100,
                overflow: 'hidden',
              }}
              fontType={FontType.md}
              ellipsizeMode="tail"
              numberOfLines={1}>
              {message.data.fileName}
            </NumberlessText>
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
    alignSelf: 'stretch',
  },
  fileBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  fileClip: {
    height: 60,
    width: 60,
    borderRadius: 16,
    backgroundColor: PortColors.primary.yellow.dull,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
