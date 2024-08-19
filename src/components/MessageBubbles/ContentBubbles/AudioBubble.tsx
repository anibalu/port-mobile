import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {useAudioPlayerContext} from 'src/context/AudioPlayerContext';
import {MessageStatus} from '@utils/Messaging/interfaces';
import {formatDuration} from '@utils/Time';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortSpacing} from '@components/ComponentUtils';
import {CircleSnail} from 'react-native-progress';
import ProgressBar from '@components/Reusable/Loaders/ProgressBar';
import {RenderTimeStamp, handleDownload, handleRetry} from '../BubbleUtils';

import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {
  LineMessageData,
  LoadedMessage,
} from '@utils/Storage/DBCalls/lineMessage';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

const AudioBubble = ({
  message,
  handlePress,
  handleLongPress,
}: {
  message: LoadedMessage;
  handlePress: any;
  handleLongPress: any;
}) => {
  const [fileUri, setFileUri] = useState<string | undefined | null>(
    getSafeAbsoluteURI(message.filePath || message.data.fileUri || null),
  );
  useMemo(() => {
    setFileUri(
      getSafeAbsoluteURI(message.filePath || message.data.fileUri || null),
    );
  }, [message]);
  const [downloading, setDownloading] = useState(false);
  //responsible for retry loader
  const [loadingRetry, setLoadingRetry] = useState(false);

  const onRetryClick = async (messageObj: LineMessageData) => {
    setLoadingRetry(true);
    await handleRetry(messageObj);
    setLoadingRetry(false);
  };

  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };

  const durationTime = message?.data?.duration;

  const {mediaDownloadError} = useErrorModal();
  const triggerDownload = async () => {
    setDownloading(true);
    await handleDownload(message.chatId, message.messageId, () =>
      mediaDownloadError(),
    );
    setDownloading(false);
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playTime, setPlayTime] = useState(formatDuration(durationTime));

  const {onStartPlay, currentlyPlaying, clearRecordingListeners, onStopPlayer} =
    useAudioPlayerContext();

  const startPlay = (fileUri, setPlayTime, setProgress) => {
    onStartPlay(setProgress, setPlayTime, fileUri);
  };

  const handleStartPlay = () => {
    if (fileUri !== null) {
      setIsPlaying(true);
      clearRecordingListeners();
      startPlay(fileUri, setPlayTime, setProgress);
    } else {
      triggerDownload();
    }
  };

  useEffect(() => {
    //If the active player changes
    if (currentlyPlaying) {
      //If the changed value is not the same as the message, it means that the message has to be reset.
      if (currentlyPlaying !== fileUri) {
        setIsPlaying(false);
        setProgress(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentlyPlaying]);

  const Colors = DynamicColors();
  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'UploadSendGrey',
      light: require('@assets/light/icons/UploadSendGrey.svg').default,
      dark: require('@assets/dark/icons/UploadSendGrey.svg').default,
    },
    {
      assetName: 'DownloadIcon',
      light: require('@assets/light/icons/Download.svg').default,
      dark: require('@assets/dark/icons/Download.svg').default,
    },
    {
      assetName: 'Pause',
      light: require('@assets/light/icons/Pause.svg').default,
      dark: require('@assets/dark/icons/Pause.svg').default,
    },
    {
      assetName: 'Play',
      light: require('@assets/light/icons/Play.svg').default,
      dark: require('@assets/dark/icons/Play.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);

  const UploadSend = results.UploadSendGrey;
  const Download = results.DownloadIcon;
  const Pause = results.Pause;
  const Play = results.Play;

  return (
    <Pressable
      onPress={() => handlePress(message.messageId)}
      onLongPress={handleLongPressFunction}
      style={styles.textBubbleContainer}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {message.messageStatus === MessageStatus.unsent ? (
          <>
            {loadingRetry ? (
              <View
                style={{
                  marginRight: PortSpacing.tertiary.right,
                }}>
                <ActivityIndicator
                  size={'small'}
                  color={Colors.primary.accent}
                />
              </View>
            ) : (
              <Pressable
                style={{
                  marginRight: PortSpacing.tertiary.right,
                }}
                onPress={() => onRetryClick(message)}>
                <UploadSend width={20} height={20} />
              </Pressable>
            )}
          </>
        ) : (
          <>
            {!fileUri ? (
              !downloading ? (
                <Pressable onPress={handleStartPlay} style={{height: 16}}>
                  <Download
                    style={{
                      marginRight: 8,
                      marginLeft: -2,
                    }}
                  />
                </Pressable>
              ) : (
                <CircleSnail
                  style={{marginRight: 6, marginLeft: -4}}
                  size={17}
                  thickness={2}
                  color={Colors.primary.accent}
                  duration={500}
                />
              )
            ) : isPlaying ? (
              <Pressable
                hitSlop={{top: 20, right: 20, left: 10, bottom: 20}}
                onPress={() => {
                  setIsPlaying(false);
                  onStopPlayer();
                }}>
                <Pause style={{marginRight: 7}} />
              </Pressable>
            ) : (
              <Pressable
                hitSlop={{top: 20, right: 20, left: 10, bottom: 20}}
                onPress={handleStartPlay}>
                <Play style={{marginRight: 7}} />
              </Pressable>
            )}
          </>
        )}

        <ProgressBar
          isSender={message.sender}
          progress={progress}
          setIsPlaying={setIsPlaying}
        />
      </View>
      <View style={styles.isMessageStyle}>
        <NumberlessText
          style={{
            color: Colors.text.primary,
          }}
          fontSizeType={FontSizeType.s}
          fontType={FontType.rg}>
          {playTime}
        </NumberlessText>
      </View>
      <RenderTimeStamp message={message} />
    </Pressable>
  );
};
const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'stretch',
    padding: 16,
    paddingHorizontal: 8,
  },
  isMessageStyle: {
    marginBottom: -18,
    marginTop: 8,
    marginLeft: 12,
  },
});

export default AudioBubble;
