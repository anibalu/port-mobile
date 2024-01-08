import Download from '@assets/icons/Download.svg';
import Play from '@assets/icons/videoPlay.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
} from '@components/NumberlessText';
import {handleAsyncMediaDownload} from '@utils/Messaging/Receive/ReceiveDirect/HandleMediaDownload';
import {LargeDataParams, SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {createThumbnail} from 'react-native-create-thumbnail';
import FileViewer from 'react-native-file-viewer';
import {
  renderProfileName,
  renderTimeStamp,
  shouldRenderProfileName,
} from '../BubbleUtils';
import {SelectedMessagesSize} from '../Chat';
import VideoReplyContainer from '../ReplyContainers/VideoReplyContainer';
//import store from '@store/appStore';

export default function VideoBubble({
  message,
  handlePress,
  handleLongPress,
  memberName,
  isReply = false,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  memberName: string;
  isReply?: boolean;
}): ReactNode {
  const [videoURI, setVideoURI] = useState<string | null>();
  const [loading, setLoading] = useState<boolean>(false);
  const [startedManualDownload, setStartedManualDownload] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | undefined>();

  //Thumbnail generation for videos
  useEffect(() => {
    (async () => {
      setLoading(true);
      if ((message.data as LargeDataParams).fileUri != null) {
        setThumbnail(
          (
            await createThumbnail({
              url: 'file://' + (message.data as LargeDataParams).fileUri!,
              timeStamp: 0,
            })
          ).path,
        );

        setVideoURI((message.data as LargeDataParams).fileUri);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, message.data, (message.data as LargeDataParams).fileUri]);

  const handleLongPressFunction = (): void => {
    handleLongPress(message.messageId);
  };
  const handlePressFunction = (): void => {
    const selectedMessagesSize = handlePress(message.messageId);
    if (
      selectedMessagesSize === SelectedMessagesSize.empty &&
      videoURI != undefined
    ) {
      FileViewer.open(videoURI, {
        showOpenWithDialog: true,
      });
    }
  };

  const triggerDownload = async () => {
    setStartedManualDownload(true);
    try {
      await handleAsyncMediaDownload(message.chatId, message.messageId);
    } catch (e) {
      console.log('Error downloading media: ', e);
    } finally {
      setStartedManualDownload(false);
    }
  };

  return (
    <Pressable
      style={styles.textBubbleContainer}
      onPress={handlePressFunction}
      onLongPress={handleLongPressFunction}>
      {isReply ? (
        <VideoReplyContainer message={message} memberName={memberName} />
      ) : (
        <>
          {renderProfileName(
            shouldRenderProfileName(memberName),
            memberName,
            message.sender,
            isReply,
          )}

          {loading || startedManualDownload ? (
            <Loader />
          ) : (
            renderDisplay(
              thumbnail,
              message.data as LargeDataParams,
              triggerDownload,
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
        </>
      )}
      {!isReply && renderTimeStamp(message)}
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
  thumbnail: string | undefined,
  data: LargeDataParams,
  onDownloadPressed: () => void,
) => {
  if (thumbnail) {
    return (
      <>
        <Image source={{uri: thumbnail}} style={styles.image} />
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
      <Pressable onPress={onDownloadPressed}>
        <View style={styles.image} />
        <Download
          style={{
            position: 'absolute',
            top: 0.29 * screen.width - 40,
            left: 0.29 * screen.width - 45,
          }}
        />
      </Pressable>
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
