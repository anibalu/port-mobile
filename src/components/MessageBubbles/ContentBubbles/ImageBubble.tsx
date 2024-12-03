import {LargeDataParams, MessageStatus} from '@utils/Messaging/interfaces';
import React, {ReactNode, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  RenderTimeStamp,
  handleDownload,
  IMAGE_DIMENSIONS,
  handleRetry,
} from '../BubbleUtils';
import {useErrorModal} from 'src/context/ErrorModalContext';
import SmallLoader from '@components/Reusable/Loaders/SmallLoader';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {TextBubble} from './TextBubble';
import LinearGradient from 'react-native-linear-gradient';
import Download from '@assets/icons/Download.svg';
import {useNavigation} from '@react-navigation/native';
import UploadSend from '@assets/icons/UploadSend.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {
  LineMessageData,
  LoadedMessage,
} from '@utils/Storage/DBCalls/lineMessage';

export const ImageBubble = ({
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
  const [imageUri, setImageUri] = useState<string | undefined | null>(
    message.filePath || message.data.fileUri || null,
  );
  useMemo(() => {
    setImageUri(message.filePath || message.data.fileUri || null);
  }, [message]);

  const {mediaDownloadError} = useErrorModal();
  const triggerDownload = async () => {
    setStartedManualDownload(true);
    await handleDownload(message.chatId, message.messageId, () =>
      mediaDownloadError(),
    );
    setStartedManualDownload(false);
  };
  const navigation = useNavigation();
  const handlePressFunction = async () => {
    const selectionMode = handlePress(message.messageId);
    if (!selectionMode) {
      if (!imageUri) {
        triggerDownload();
      } else {
        // Push the media viewer onto the stack so that the user can consistently navigate back
        navigation.push('MediaViewer', {
          message: message,
        });
      }
    }
  };
  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };

  const onRetryClick = async (messageObj: LineMessageData) => {
    setLoadingRetry(true);
    await handleRetry(messageObj);
    setLoadingRetry(false);
  };

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
                backgroundColor: PortColors.primary.black,
              })}>
              <SmallLoader />
            </View>
          ) : (
            renderDisplay(imageUri, message.data as LargeDataParams)
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
                    color={PortColors.primary.blue.app}
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
) => {
  if (messageURI) {
    return (
      messageURI && (
        <Image
          source={{uri: getSafeAbsoluteURI(messageURI)}}
          style={styles.image}
        />
      )
    );
  }

  //If we're here, this means that thumbnail is undefined and is on autodownload
  if (data.shouldDownload) {
    return (
      <View
        style={StyleSheet.compose(styles.image, {
          backgroundColor: PortColors.primary.black,
        })}>
        <SmallLoader />
      </View>
    );
  }
  //If we're here, this means no thumbnail and no autodownload
  if (!data.shouldDownload) {
    return (
      <>
        <View
          style={StyleSheet.compose(styles.image, {
            backgroundColor: PortColors.primary.black,
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

const styles = StyleSheet.create({
  imageBubbleContainer: {
    flexDirection: 'column',
    width: IMAGE_DIMENSIONS,
    minHeight: IMAGE_DIMENSIONS,
    alignItems: 'center',
  },
  image: {
    height: IMAGE_DIMENSIONS, // Set the maximum height you desire
    width: IMAGE_DIMENSIONS, // Set the maximum width you desire
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -35}, {translateY: -20}],
    borderRadius: 20,
    padding: PortSpacing.medium.uniform,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(61, 61, 61, 0.60)',
    flexDirection: 'row',
    gap: PortSpacing.tertiary.uniform,
  },
  gradientContainer: {
    position: 'absolute',
    width: IMAGE_DIMENSIONS,
    height: IMAGE_DIMENSIONS,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    borderRadius: 12,
    paddingBottom: PortSpacing.tertiary.bottom,
    paddingRight: PortSpacing.tertiary.right,
  },
});
