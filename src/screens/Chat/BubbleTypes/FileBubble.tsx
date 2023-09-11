import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Pressable, Dimensions} from 'react-native';

import {
  NumberlessItalicText,
  NumberlessMediumText,
  NumberlessRegularText,
} from '../../../components/NumberlessText';
import {getTime} from '../../../utils/Time';
import Sending from '../../../../assets/icons/sending.svg';
import File from '../../../../assets/icons/FileClip.svg';
import {
  ContentType,
  directMessageContent,
} from '../../../utils/MessageInterface';
import {createTempFileUpload, uploadLargeFile} from '../../../utils/LargeFiles';
import {DirectMessaging} from '../../../utils/DirectMessaging';
import FileViewer from 'react-native-file-viewer';

/**
 * Renders file container to be inserted into chat bubbles.
 * @param props MediaContent object containing text and timestamp to render.
 * @returns Rendered text content
 */
export default function FileBubble(props: {
  message: directMessageContent;
  lineId: string;
}) {
  // TODO: Error handling - in the event that the file path points to an invalid
  //       path, the program should handle this gracefully. It currently will try
  //       and load whatever string is already there.
  // const viewWidth = Dimensions.get('window').width;
  const [isSent, setIsSent] = useState<boolean>(false);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [uploadFailed, setUploadFailed] = useState<boolean>(false);
  const fileDataUri =
    props.message.data.file?.uri || `${props.message.data.filePath}` || '';
  const fileTitle =
    props.message.data.file?.name || props.message.data.fileName || '';

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
            messageType: ContentType.OTHER_FILE,
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
    <View style={styles.fileBubbleContainer}>
      <View>
        {uploadFailed ? (
          <View>
            <NumberlessItalicText style={styles.text}>
              File upload failed.
            </NumberlessItalicText>
          </View>
        ) : (
          <View>
            {isUploaded ? (
              <View>
                {isSent ? (
                  <Pressable
                    onPress={() => {
                      console.log('pdf location: ', fileDataUri);
                      FileViewer.open(fileDataUri, {showOpenWithDialog: true});
                    }}>
                    <View style={styles.fileBox}>
                      <View style={styles.fileClip}>
                        <File />
                      </View>
                      <NumberlessMediumText
                        style={styles.fileName}
                        ellipsizeMode="tail"
                        numberOfLines={1}>
                        {fileTitle}
                      </NumberlessMediumText>
                    </View>
                  </Pressable>
                ) : (
                  <View>
                    <NumberlessItalicText style={styles.text}>
                      sending file...
                    </NumberlessItalicText>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <NumberlessItalicText style={styles.text}>
                  preparing file...
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
  fileBubbleContainer: {
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
