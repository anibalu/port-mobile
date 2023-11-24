import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Pressable, Image, Dimensions} from 'react-native';
import {
  NumberlessMediumText,
  NumberlessRegularText,
} from '../../../components/NumberlessText';
import {getTimeStamp} from '../../../utils/Time';
import {
  SavedMessageParams,
  SendStatus,
} from '../../../utils/Messaging/interfaces';
import Sending from '../../../../assets/icons/sending.svg';
import {DEFAULT_NAME} from '../../../configs/constants';
import FileViewer from 'react-native-file-viewer';
import DefaultImage from '../../../../assets/avatars/avatar.png';
import VideoReplyContainer from '../ReplyContainers/VideoReplyContainer';

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
}) {
  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  useEffect(() => {
    if (message.data.fileUri) {
      setProfileURI('file://' + message.data.fileUri);
    }
  }, [message]);
  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={() => handlePress(message.messageId)}
      onLongPress={() => handleLongPress(message.messageId)}>
      {isReply ? (
        <VideoReplyContainer message={message} memberName={memberName} />
      ) : (
        <>
          <View>
            {renderProfileName(
              shouldRenderProfileName(message, memberName),
              memberName,
            )}
          </View>
          <Pressable
            onPress={() => {
              FileViewer.open(profileURI, {
                showOpenWithDialog: true,
              });
            }}>
            <Image source={{uri: profileURI}} style={styles.image} />
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

function shouldRenderProfileName(
  message: SavedMessageParams,
  memberName: string,
) {
  if (memberName === '') {
    return false;
  } else {
    return true;
  }
}

function renderProfileName(shouldRender: boolean, name: string = DEFAULT_NAME) {
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
const viewWidth = Dimensions.get('window').width;
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
    color: '#868686',
  },
  failedStamp: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  text: {
    color: '#000000',
  },
  image: {
    height: 0.7 * viewWidth - 40, // Set the maximum height you desire
    width: 0.7 * viewWidth - 40, // Set the maximum width you desire
    borderRadius: 16,
  },
});
