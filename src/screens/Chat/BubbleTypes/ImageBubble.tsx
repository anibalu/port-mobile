import React from 'react';
import {View, StyleSheet, Pressable, Dimensions, Image} from 'react-native';
import {NumberlessRegularText} from '../../../components/NumberlessText';
import {getTimeStamp} from '../../../utils/Time';
import {
  SavedMessageParams,
  SendStatus,
} from '../../../utils/Messaging/interfaces';
import Sending from '../../../../assets/icons/sending.svg';
import FileViewer from 'react-native-file-viewer';

export default function ImageBubble({
  message,
  handlePress,
  handleLongPress,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
}) {
  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={() => handlePress(message.messageId)}
      onLongPress={() => handleLongPress(message.messageId)}>
      <View>
        {message.data.fileUri === undefined || message.data.fileUri === '' ? (
          <View />
        ) : (
          <Pressable
            onPress={() => {
              FileViewer.open(`file://${message.data.filePath}`, {
                showOpenWithDialog: true,
              });
            }}>
            <Image
              source={{uri: `${message.data.filePath}`}}
              style={styles.image}
            />
          </Pressable>
        )}
      </View>
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
    color: '#B7B6B6',
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
