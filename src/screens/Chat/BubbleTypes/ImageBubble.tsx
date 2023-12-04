import React, {useEffect, useState} from 'react';
import {Dimensions, Image, Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import DefaultImage from '@assets/avatars/avatar.png';
import Sending from '@assets/icons/sending.svg';
import {
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {SavedMessageParams, SendStatus} from '@utils/Messaging/interfaces';
import {getTimeStamp} from '@utils/Time';
import ImageReplyContainer from '../ReplyContainers/ImageReplyContainer';
import {PortColors} from '@components/ComponentUtils';
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
  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  useEffect(() => {
    if (message.data.fileUri) {
      setProfileURI('file://' + message.data.fileUri);
    }
  }, [message]);

  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };

  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={() => {
        handlePress(message.messageId);
      }}
      onLongPress={handleLongPressFunction}>
      {isReply ? (
        <ImageReplyContainer message={message} memberName={memberName} />
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
          <Pressable
            onLongPress={handleLongPressFunction}
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
    height: 0.7 * viewWidth - 40, // Set the maximum height you desire
    width: 0.7 * viewWidth - 40, // Set the maximum width you desire
    borderRadius: 16,
  },
  replyImage: {
    height: 65,
    width: 65,

    borderRadius: 16,
  },
  replyImageContainer: {
    width: 0.7 * viewWidth - 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageText: {
    marginTop: 10,
  },
});
