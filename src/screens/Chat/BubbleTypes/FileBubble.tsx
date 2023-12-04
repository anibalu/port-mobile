import DefaultImage from '@assets/avatars/avatar.png';
import File from '@assets/icons/FileClip.svg';
import Sending from '@assets/icons/sending.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {SavedMessageParams, SendStatus} from '@utils/Messaging/interfaces';
import {getTimeStamp} from '@utils/Time';
import React, {ReactNode, useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
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
  const [fileURI, setFileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  useEffect(() => {
    if (message.data.fileUri) {
      setFileURI('file://' + message.data.fileUri);
    }
  }, [message]);
  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={() => handlePress(message.messageId)}
      onLongPress={() => handleLongPress(message.messageId)}>
      {isReply ? (
        <FileReplyContainer message={message} memberName={memberName} />
      ) : (
        <>
          <View>
            {renderProfileName(shouldRenderProfileName(memberName), memberName)}
          </View>
          <Pressable
            onPress={() => {
              FileViewer.open(fileURI, {
                showOpenWithDialog: true,
              });
            }}>
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
          </Pressable>
        </>
      )}
      {!isReply && (
        <View style={styles.timeStampContainer}>
          {message.sendStatus === SendStatus.success || !message.sender ? (
            <View>
              <NumberlessRegularText style={styles.timeStamp}>
                {getTimeStamp(message.timestamp)}
              </NumberlessRegularText>
            </View>
          ) : (
            <View>
              {message.sendStatus === SendStatus.journaled ? (
                <View>
                  <Sending />
                </View>
              ) : (
                <View>
                  {message.sendStatus === SendStatus.failed ? (
                    <View>
                      <NumberlessRegularText style={styles.failedStamp}>
                        {'failed'}
                      </NumberlessRegularText>
                    </View>
                  ) : (
                    <View>
                      <Sending />
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
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
): ReactNode {
  return (
    <View>
      {shouldRender ? (
        <NumberlessMediumText>{name}</NumberlessMediumText>
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
