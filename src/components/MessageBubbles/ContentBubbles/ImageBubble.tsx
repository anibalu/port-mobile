import {
  LargeDataParams,
  MessageStatus,
  SavedMessageParams,
  TextParams,
} from '@utils/Messaging/interfaces';
import React, {ReactNode, useEffect, useState} from 'react';
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
  handleMediaOpen,
  IMAGE_DIMENSIONS,
} from '../BubbleUtils';
import {useErrorModal} from 'src/context/ErrorModalContext';
import SmallLoader from '@components/Reusable/Loaders/SmallLoader';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {TextBubble} from './TextBubble';
import LinearGradient from 'react-native-linear-gradient';
import Download from '@assets/icons/Download.svg';
import UploadSend from '@assets/icons/UploadSend.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

export const ImageBubble = ({
  message,
  handlePress,
  handleLongPress,
  handleRetry,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  handleRetry: (message: SavedMessageParams) => void;
}): ReactNode => {
  const [startedManualDownload, setStartedManualDownload] = useState(false);
  const [loadingRetry, setLoadingRetry] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const {mediaDownloadError} = useErrorModal();
  const download = async () => {
    try {
      await handleDownload(message.chatId, message.messageId);
    } catch (error) {
      console.log('Error downloading media', error);
      mediaDownloadError();
    }
  };
  const triggerDownload = async () => {
    setStartedManualDownload(true);
    await download();
    setStartedManualDownload(false);
  };
  const handlePressFunction = () => {
    const selectionMode = handlePress(message.messageId);
    if (!selectionMode) {
      handleMediaOpen(
        (message.data as LargeDataParams).fileUri,
        triggerDownload,
        mediaDownloadError,
      );
    }
  };
  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };

  useEffect(() => {
    setShowRetry(message.messageStatus === MessageStatus.unsent);
    setLoadingRetry(message.messageStatus === MessageStatus.sent);
  }, [message]);

  const text = (message.data as TextParams).text;

  const onRetryClick = async (messageObj: SavedMessageParams) => {
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
            renderDisplay(
              (message.data as LargeDataParams).fileUri,
              message.data as LargeDataParams,
            )
          )}
        </View>
        {text ? (
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
            {showRetry && (
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
          source={{uri: getSafeAbsoluteURI(messageURI, 'doc')}}
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
