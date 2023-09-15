import React, {useEffect, useState} from 'react';

import {View, StyleSheet, Pressable, Dimensions} from 'react-native';

import {
  NumberlessItalicText,
  NumberlessRegularText,
} from '../../../components/NumberlessText';
import {getTime} from '../../../utils/Time';
import Sending from '../../../../assets/icons/sending.svg';

import {
  ContentType,
  directMessageContent,
} from '../../../utils/MessageInterface';
import {createTempFileUpload, uploadLargeFile} from '../../../utils/LargeFiles';
import {DirectMessaging} from '../../../utils/DirectMessaging';
import FileViewer from 'react-native-file-viewer';
import VideoPlay from '../../../../assets/miscellaneous/VideoPlay.svg';
/**
 * Renders image container to be inserted into chat bubbles.
 * @param props MediaContent object containing text and timestamp to render.
 * @returns Rendered text content
 */
export default function VideoBubble(props: {
  message: directMessageContent;
  lineId: string;
}) {
  // TODO: Error handling - in the event that the file path points to an invalid
  //       path, the program should handle this gracefully. It currently will try
  //       and load whatever string is already there.
  const [isSent, setIsSent] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [uploadFailed, setUploadFailed] = useState<boolean>(false);
  const videoUri =
    props.message.data.file?.uri ||
    `file://${props.message.data.filePath}` ||
    '';
  useEffect(() => {
    if (props.message.data.mediaId === undefined) {
      const uploadFunc = async () => {
        const fileUri = await createTempFileUpload(props.message.data.file);
        const mediaId = (await uploadLargeFile(fileUri))?.mediaId;
        if (mediaId === undefined) {
          setUploadFailed(true);
          return false;
        } else {
          setIsUploaded(true);
          const messaging = new DirectMessaging(props.lineId);
          const ret = await messaging.sendMessage({
            messageId: messaging.generateMessageId(),
            messageType: ContentType.VIDEO,
            data: {
              mediaId: mediaId,
              filePath: fileUri,
              timestamp: props.message.data.timestamp,
              sender: true,
              fileName: props.message.data.file?.name || '',
            },
          });
          return ret;
        }
      };
      uploadFunc().then(x => setIsSent(x));
    } else {
      setIsSent(true);
      setIsUploaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={styles.imageBubbleContainer}>
      <View>
        {uploadFailed ? (
          <View>
            <NumberlessItalicText style={styles.text}>
              Video upload failed.
            </NumberlessItalicText>
          </View>
        ) : (
          <View>
            {isUploaded ? (
              <View>
                {isSent ? (
                  <Pressable
                    onPress={() => {
                      FileViewer.open(videoUri, {showOpenWithDialog: true});
                    }}
                    style={styles.videoPreview}>
                    <VideoPlay />
                  </Pressable>
                ) : (
                  <View>
                    <NumberlessItalicText style={styles.text}>
                      sending video...
                    </NumberlessItalicText>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <NumberlessItalicText style={styles.text}>
                  preparing video...
                </NumberlessItalicText>
              </View>
            )}
          </View>
        )}
      </View>
      <View style={styles.timeStampContainer}>
        {isSent ? (
          <View>
            <NumberlessRegularText style={styles.timeStamp}>
              {getTime(props.message.data.timestamp)}
            </NumberlessRegularText>
          </View>
        ) : (
          <View>
            <Sending />
          </View>
        )}
      </View>
    </View>
  );
}
const viewWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  imageBubbleContainer: {
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
  text: {
    color: '#000000',
  },
  image: {
    height: 0.7 * viewWidth - 40,
    width: 0.7 * viewWidth - 40,
    borderRadius: 16,
  },
  videoPreview: {
    height: 0.7 * viewWidth - 40,
    width: 0.7 * viewWidth - 40,
    backgroundColor: '#000000',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
