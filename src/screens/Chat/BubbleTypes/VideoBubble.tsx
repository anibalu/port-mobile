import Download from '@assets/icons/Download.svg';
import Play from '@assets/icons/videoPlay.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {LargeDataParams, SavedMessageParams} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import React, {ReactNode, useState} from 'react';
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

const videoDimensions = 0.7 * screen.width - 40;

export default function VideoBubble({
  message,
  handlePress,
  handleLongPress,
  handleDownload,
  memberName,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  handleDownload: (x: string) => Promise<void>;
  memberName: string;
}): ReactNode {
  const [startedManualDownload, setStartedManualDownload] = useState(false);
  const {mediaDownloadError} = useErrorModal();

  const triggerDownload = async () => {
    setStartedManualDownload(true);
    await handleDownload(message.messageId);
    setStartedManualDownload(false);
  };

  const handlePressFunction = (): void => {
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
      style={styles.textBubbleContainer}
      onPress={handlePressFunction}
      onLongPress={handleLongPress}>
      {renderProfileName(
        shouldRenderProfileName(memberName),
        memberName,
        message.sender,
        false,
        message.sender,
      )}

      {startedManualDownload ? (
        <Loader />
      ) : (
        renderDisplay(
          (message.data as LargeDataParams).previewUri,
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
    </Pressable>
  );
}

const Loader = () => {
  return (
    <View style={styles.image}>
      <CircleSnail color={PortColors.primary.blue.app} duration={500} />
    </View>
  );
};

// Conditions:
// - if thumbnail exists
// - if shouldDownload is true and no thumbnail exists
// - if shouldDownload is false on and no thumbnail exists
const renderDisplay = (
  thumbnail: string | null | undefined,
  data: LargeDataParams,
) => {
  if (thumbnail) {
    return (
      <>
        <Image
          source={{uri: getSafeAbsoluteURI(thumbnail, 'cache')}}
          style={styles.image}
        />
        <Play
          style={{
            position: 'absolute',
            top: 0.35 * screen.width - 40,
            left: 0.35 * screen.width - 45,
          }}
        />
      </>
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
        <View style={styles.image} />
        <Download
          style={{
            position: 'absolute',
            top: 0.38 * screen.width - 40,
            left: 0.38 * screen.width - 40,
          }}
        />
      </>
    );
  }
};

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  image: {
    height: videoDimensions, // Set the maximum height you desire
    width: videoDimensions, // Set the maximum width you desire
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: PortColors.primary.black,
  },

  gradientContainer: {
    position: 'absolute',
    bottom: 4,
    width: videoDimensions,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    paddingRight: 10,
    height: 50,
  },
});
