import DefaultImage from '@assets/avatars/avatar.png';
import File from '@assets/icons/FileClip.svg';
import Sending from '@assets/icons/sending.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {
  NumberlessItalicText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {SavedMessageParams, MessageStatus} from '@utils/Messaging/interfaces';
import {getTimeStamp} from '@utils/Time';
import React, {ReactNode, useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import FileReplyContainer from '../ReplyContainers/FileReplyContainer';
import {SelectedMessagesSize} from '../Chat';

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
  const [fileURI, setFileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
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
    if (selectedMessagesSize === SelectedMessagesSize.empty) {
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
          <View>
            {renderProfileName(
              shouldRenderProfileName(memberName),
              memberName,
              message.sender,
              isReply,
            )}
          </View>
          <View>
            <View style={styles.fileBox}>
              <View style={styles.fileClip}>
                <File />
              </View>
              <NumberlessMediumText
                style={styles.fileName}
                ellipsizeMode="tail"
                numberOfLines={1}>
                {message.data.fileName}
              </NumberlessMediumText>
            </View>
          </View>
        </>
      )}
      {!isReply && renderTimeStamp(message)}
    </Pressable>
  );
}

function renderTimeStamp(message: SavedMessageParams) {
  if (message.messageStatus === MessageStatus.sent || !message.sender) {
    return (
      <View style={styles.timeStampContainer}>
        <NumberlessRegularText style={styles.timeStamp}>
          {getTimeStamp(message.timestamp)}
        </NumberlessRegularText>
      </View>
    );
  } else if (message.messageStatus === MessageStatus.failed) {
    return (
      <View style={styles.timeStampContainer}>
        <NumberlessItalicText style={styles.failedStamp}>
          failed
        </NumberlessItalicText>
      </View>
    );
  } else {
    return (
      <View style={styles.timeStampContainer}>
        <Sending />
      </View>
    );
  }
}

function shouldRenderProfileName(memberName: string) {
  if (memberName === '') {
    return false;
  } else {
    return true;
  }
}

function renderProfileName(
  shouldRender: boolean,
  name: string = DEFAULT_NAME,
  isSender: boolean,
  isReply: boolean,
) {
  return (
    <View>
      {shouldRender ? (
        <NumberlessMediumText>{name}</NumberlessMediumText>
      ) : isSender && isReply ? (
        <NumberlessMediumText>You</NumberlessMediumText>
      ) : (
        <View />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  timeStampContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  timeStamp: {
    fontSize: 10,
    color: PortColors.primary.grey.dark,
  },
  failedStamp: {
    fontSize: 10,
    color: PortColors.primary.grey.medium,
  },
  text: {
    color: '#000000',
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
  fileName: {
    color: 'black',
    overflow: 'hidden',
    width: 0.7 * screen.width - 100,
    marginLeft: 10,
    fontSize: 12,
  },
});
