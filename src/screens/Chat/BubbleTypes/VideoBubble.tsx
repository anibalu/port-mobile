import Download from '@assets/icons/Download.svg';
import Play from '@assets/icons/videoPlay.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
} from '@components/NumberlessText';
import {LargeDataParams, SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {renderProfileName, shouldRenderProfileName} from '../BubbleUtils';
import {SelectedMessagesSize} from '../Chat';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

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
  const [videoURI, setVideoURI] = useState<string | null>();
  const [loading, setLoading] = useState<boolean>(false);
  const [startedManualDownload, setStartedManualDownload] = useState(false);

  //Thumbnail generation for videos
  useEffect(() => {
    (async () => {
      setLoading(true);
      const uri = (message.data as LargeDataParams).fileUri;
      if (uri != null) {
        setVideoURI(getSafeAbsoluteURI(uri, 'doc'));
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, message.data, (message.data as LargeDataParams).fileUri]);

  const handleLongPressFunction = (): void => {
    handleLongPress(message.messageId);
  };

  const triggerDownload = async () => {
    setStartedManualDownload(true);
    await handleDownload(message.messageId);
    setStartedManualDownload(false);
  };

  const handlePressFunction = (): void => {
    const selectedMessagesSize = handlePress(message.messageId);
    if (selectedMessagesSize === SelectedMessagesSize.empty) {
      if (videoURI != undefined) {
        FileViewer.open(videoURI, {
          showOpenWithDialog: true,
        });
      } else {
        triggerDownload();
      }
    }
  };

  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={handlePressFunction}
      onLongPress={handleLongPressFunction}>
      {renderProfileName(
        shouldRenderProfileName(memberName),
        memberName,
        message.sender,
        false,
      )}

      {loading || startedManualDownload ? (
        <Loader />
      ) : (
        renderDisplay(
          (message.data as LargeDataParams).previewUri,
          message.data as LargeDataParams,
        )
      )}

      {(message.data as LargeDataParams).text ? (
        <View
          style={{
            marginTop: 8,
            marginHorizontal: 8,
          }}>
          <NumberlessLinkText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            {(message.data as LargeDataParams).text || ''}
          </NumberlessLinkText>
        </View>
      ) : null}
    </Pressable>
  );
}

const Loader = () => {
  return (
    <View style={styles.image}>
      <ActivityIndicator size={'large'} color={PortColors.primary.white} />
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
            top: 0.25 * screen.width - 40,
            left: 0.25 * screen.width - 45,
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
            top: 0.29 * screen.width - 40,
            left: 0.29 * screen.width - 45,
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
    marginTop: 4,
    height: 0.5 * screen.width - 40, // Set the maximum height you desire
    width: 0.5 * screen.width - 40, // Set the maximum width you desire
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PortColors.primary.black,
  },
});
