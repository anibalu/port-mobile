import Download from '@assets/icons/Download.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {LargeDataParams, SavedMessageParams} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {CircleSnail} from 'react-native-progress';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {
  MediaTextDisplay,
  handleMediaOpen,
  renderProfileName,
  renderTimeStamp,
  shouldRenderProfileName,
} from '../BubbleUtils';
import {SelectedMessagesSize} from '../Chat';
//import store from '@store/appStore';

const imageDimensions = 0.7 * screen.width - 40;

export default function ImageBubble({
  message,
  handlePress,
  handleDownload,
  handleLongPress,
  memberName,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleDownload: (x: string) => Promise<void>;
  handleLongPress: any;
  memberName: string;
}) {
  const [startedManualDownload, setStartedManualDownload] = useState(false);
  const {mediaDownloadError} = useErrorModal();

  const triggerDownload = async () => {
    setStartedManualDownload(true);
    await handleDownload(message.messageId);
    setStartedManualDownload(false);
  };

  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
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

  const text = (message.data as LargeDataParams).text;

  return (
    <Pressable
      style={styles.imageBubbleContainer}
      onPress={handlePressFunction}
      onLongPress={handleLongPressFunction}>
      <>
        {renderProfileName(
          shouldRenderProfileName(memberName),
          memberName,
          message.sender,
          false,
          false,
        )}
        {startedManualDownload ? (
          <Loader />
        ) : (
          renderDisplay(
            (message.data as LargeDataParams).fileUri,
            message.data as LargeDataParams,
          )
        )}

        {text ? (
          <MediaTextDisplay text={text} message={message} />
        ) : (
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']}
            style={styles.gradientContainer}>
            {renderTimeStamp(message, true)}
          </LinearGradient>
        )}
      </>
    </Pressable>
  );
}

const Loader = () => {
  return (
    <View
      style={StyleSheet.compose(styles.image, {
        backgroundColor: PortColors.primary.black,
        justifyContent: 'center',
        alignItems: 'center',
      })}>
      <CircleSnail color={PortColors.primary.blue.app} duration={500} />
    </View>
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
      messageURI != undefined && (
        <Image
          source={{uri: getSafeAbsoluteURI(messageURI, 'doc')}}
          style={styles.image}
        />
      )
    );
  }

  //If we're here, this means that thumbnail is undefined and is on autodownload
  if (data.shouldDownload) {
    return <Loader />;
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
            top: 0.37 * screen.width - 40,
            left: 0.37 * screen.width - 40,
          }}
        />
      </>
    );
  }
};

const styles = StyleSheet.create({
  imageBubbleContainer: {
    flexDirection: 'column',
    width: imageDimensions,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  image: {
    height: imageDimensions, // Set the maximum height you desire
    width: imageDimensions, // Set the maximum width you desire
    borderRadius: 8,
    marginBottom: 4,
  },
  gradientContainer: {
    position: 'absolute',
    bottom: 4,
    width: imageDimensions,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 10,
    paddingRight: 10,
    height: 50,
  },
});
