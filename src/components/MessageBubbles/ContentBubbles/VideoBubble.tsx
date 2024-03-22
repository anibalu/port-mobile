import {
  LargeDataParams,
  SavedMessageParams,
  TextParams,
} from '@utils/Messaging/interfaces';
import React, {ReactNode, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
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
import Play from '@assets/icons/videoPlay.svg';
import {SelectedMessagesSize} from '@screens/DirectChat/Chat';

export const VideoBubble = ({
  message,
  handlePress,
  handleLongPress,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
}): ReactNode => {
  const [startedManualDownload, setStartedManualDownload] = useState(false);
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
    const selectedMessagesSize = handlePress(message.messageId);
    if (selectedMessagesSize === SelectedMessagesSize.empty) {
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

  const text = (message.data as TextParams).text;

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
              (message.data as LargeDataParams).previewUri,
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
      <View style={styles.image2}>
        <Image
          source={{uri: getSafeAbsoluteURI(messageURI, 'cache')}}
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
  image2: {
    height: IMAGE_DIMENSIONS - 1, // Set the maximum height you desire
    width: IMAGE_DIMENSIONS - 1, // Set the maximum width you desire
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PortColors.primary.black,
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
