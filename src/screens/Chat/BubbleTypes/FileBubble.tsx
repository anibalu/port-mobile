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
import File from '../../../../assets/icons/FileClip.svg';

export default function FileBubble({
  message,
  handlePress,
  handleLongPress,
  memberName,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  memberName: string;
}) {
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
      <View>
        {renderProfileName(
          shouldRenderProfileName(message, memberName),
          memberName,
        )}
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
  fileBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  fileClip: {
    height: 60,
    width: 60,
    borderRadius: 16,
    backgroundColor: '#FEB95A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    color: 'black',
    overflow: 'hidden',
    width: 0.7 * viewWidth - 100,
    marginLeft: 10,
    fontSize: 12,
  },
});
