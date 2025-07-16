import React, {ReactNode, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import { useColors } from '@components/colorGuide';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SmallLoader from '@components/Reusable/Loaders/SmallLoader';
import { Spacing } from '@components/spacingGuide';

import {LargeDataParams, MessageStatus} from '@utils/Messaging/interfaces';
import {
  LineMessageData,
  LoadedMessage,
} from '@utils/Storage/DBCalls/lineMessage';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

import Download from '@assets/icons/Download.svg';
import UploadSend from '@assets/icons/UploadSend.svg';
import Play from '@assets/icons/videoPlay.svg';

import {ToastType, useToast} from 'src/context/ToastContext';

import {
  IMAGE_DIMENSIONS,
  RenderTimeStamp,
  handleDownload,
  handleRetry,
} from '../BubbleUtils';

import {TextBubble} from './TextBubble';

export const VideoBubble = ({
  message,
  handlePress,
  handleLongPress,
}: {
  message: LoadedMessage;
  handlePress: any;
  handleLongPress: any;
}): ReactNode => {
  //responsible for download loader
  const [startedManualDownload, setStartedManualDownload] = useState(false);
  //responsible for retry loader
  const [loadingRetry, setLoadingRetry] = useState(false);
  // this is to show the previewuri
  const [previewUri, setPreviewUri] = useState<string | undefined | null>(
    message.data.previewUri || null,
  );
  // this is to open the file
  const [fileUri, setFileUri] = useState<string | undefined | null>(
    message.filePath || message.data.fileUri || null,
  );
  useMemo(() => {
    setFileUri(message.filePath || message.data.fileUri || null);
    setPreviewUri(message.data.fileUri || null);
  }, [message]);

  const onRetryClick = async (messageObj: LineMessageData) => {
    setLoadingRetry(true);
    await handleRetry(messageObj);
    setLoadingRetry(false);
  };

  const {showToast} = useToast();

  const navigation = useNavigation();
  const triggerDownload = async () => {
    setStartedManualDownload(true);
    await handleDownload(message.chatId, message.messageId, () =>
      showToast(
        'Error downloading media, please try again later!',
        ToastType.error,
      ),
    );
    setStartedManualDownload(false);
  };
  const handlePressFunction = () => {
    const selectionMode = handlePress(message.messageId);
    if (!selectionMode) {
      if (fileUri === null) {
        triggerDownload();
      } else {
        navigation.push('MediaViewer', {
          message: message,
        });
      }
    }
  };
  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };

  const Colors = useColors()
  const styles= styling(Colors)
  return (
    <Pressable
      style={styles.imageBubbleContainer}
      onPress={handlePressFunction}
      onLongPress={handleLongPressFunction}>
      <>
        <View style={styles.image}>
          {startedManualDownload ? (
            <View
              style={StyleSheet.compose(styles.image, {
                backgroundColor: Colors.black,
              })}>
              <SmallLoader theme={Colors.theme} />
            </View>
          ) : (
            renderDisplay(previewUri, message.data as LargeDataParams, Colors)
          )}
        </View>
        {(message.data as LargeDataParams).text ? (
          <View style={{width: IMAGE_DIMENSIONS, paddingTop: 4}}>
            <TextBubble message={message} />
          </View>
        ) : (
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0.75)',
            ]}
            style={styles.gradientContainer}>
            {message.messageStatus === MessageStatus.unsent && (
              <Pressable
                onPress={() => onRetryClick(message)}
                style={styles.retryButton}>
                {loadingRetry ? (
                  <ActivityIndicator
                    size={'small'}
                    color={Colors.purple}
                  />
                ) : (
                  <UploadSend width={16} height={16} />
                )}
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}
                  textColor={'#FFF'}>
                  Retry
                </NumberlessText>
              </Pressable>
            )}
            <RenderTimeStamp message={message} stampColor="w" />
          </LinearGradient>
        )}
      </>
    </Pressable>
  );
};

// Conditions:
// - if thumbnail exists
// - if shouldDownload is true and no thumbnail exists
// - if shouldDownload is false on and no thumbnail exists
export const renderDisplay = (
  messageURI: string | undefined | null,
  data: LargeDataParams,
  Colors: any
) => {
  const styles = styling(Colors)
  if (messageURI) {
    return (
      <View style={styles.image2}>
        <Image
          source={{uri: getSafeAbsoluteURI(messageURI)}}
          style={styles.image}
        />
        <Play
          style={{
            position: 'absolute',
          }}
        />
      </View>
    );
  }

  //If we're here, this means that thumbnail is undefined and is on autodownload
  if (data.shouldDownload) {
    return (
      <View
        style={StyleSheet.compose(styles.image, {
          backgroundColor: Colors.black,
        })}>
        <SmallLoader theme={Colors.theme} />
      </View>
    );
  }
  //If we're here, this means no thumbnail and no autodownload
  if (!data.shouldDownload) {
    return (
      <>
        <View
          style={StyleSheet.compose(styles.image, {
            backgroundColor: Colors.black,
          })}
        />
        <Download
          style={{
            position: 'absolute',
          }}
        />
      </>
    );
  }
};

const styling =(Colors:any)=> StyleSheet.create({
  imageBubbleContainer: {
    flexDirection: 'column',
    width: IMAGE_DIMENSIONS,
    minHeight: IMAGE_DIMENSIONS,
    alignItems: 'center',
  },
  retryButton: {
    position: 'absolute',
    bottom: 4,
    left: Spacing.s,
    borderRadius: 20,
    padding: Spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(61, 61, 61, 0.60)',
    flexDirection: 'row',
    gap: Spacing.s,
  },
  image: {
    height: IMAGE_DIMENSIONS, // Set the maximum height you desire
    width: IMAGE_DIMENSIONS, // Set the maximum width you desire
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image2: {
    height: IMAGE_DIMENSIONS - 1, // Set the maximum height you desire
    width: IMAGE_DIMENSIONS - 1, // Set the maximum width you desire
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  gradientContainer: {
    position: 'absolute',
    width: IMAGE_DIMENSIONS,
    height: IMAGE_DIMENSIONS,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    borderRadius: 12,
  },
});
