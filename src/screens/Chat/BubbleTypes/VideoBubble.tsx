import DefaultImage from '@assets/avatars/avatar.png';
import Sending from '@assets/icons/sending.svg';
import Play from '@assets/icons/videoPlay.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {
  NumberlessItalicText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {SavedMessageParams, SendStatus} from '@utils/Messaging/interfaces';
import {getTimeStamp} from '@utils/Time';
import React, {ReactNode, useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
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
  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  useEffect(() => {
    if (message.data.fileUri) {
      setProfileURI('file://' + message.data.fileUri);
    }
  }, [message]);

  const handleLongPressFunction = (): void => {
    handleLongPress(message.messageId);
  };
  const handlePressFunction = (): void => {
    const selectedMessagesSize = handlePress(message.messageId);
    if (selectedMessagesSize === SelectedMessagesSize.empty) {
      FileViewer.open(profileURI, {
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
          <View>
            {renderProfileName(
              shouldRenderProfileName(memberName),
              memberName,
              message.sender,
              isReply,
            )}
          </View>
          <View style={styles.image}>
            <Play />
          </View>
        </>
      )}
      {!isReply && renderTimeStamp(message)}
    </Pressable>
  );
}

function renderTimeStamp(message: SavedMessageParams): ReactNode {
  if (message.sendStatus === SendStatus.success || !message.sender) {
    return (
      <View style={styles.timeStampContainer}>
        <NumberlessRegularText style={styles.timeStamp}>
          {getTimeStamp(message.timestamp)}
        </NumberlessRegularText>
      </View>
    );
  } else if (message.sendStatus === SendStatus.failed) {
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

function shouldRenderProfileName(memberName: string): boolean {
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
): ReactNode {
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
  image: {
    marginTop: 4,
    height: 0.7 * screen.width - 40, // Set the maximum height you desire
    width: 0.7 * screen.width - 40, // Set the maximum width you desire
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PortColors.primary.black,
  },
  replyImage: {
    height: 65,
    width: 65,

    borderRadius: 16,
  },
  replyImageContainer: {
    width: 0.7 * screen.width - 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageText: {
    marginTop: 10,
  },
});
