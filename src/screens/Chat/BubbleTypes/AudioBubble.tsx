import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Play from '@assets/icons/Voicenotes/BluePlay.svg';
import Download from '@assets/icons/DownloadIcon.svg';
import Pause from '@assets/icons/Voicenotes/BluePause.svg';
import ProgressBar from '../../../components/Reusable/Loaders/ProgressBar';
import {renderTimeStamp} from '../BubbleUtils';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {useAudioPlayerContext} from 'src/context/AudioPlayerContext';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import {formatDuration} from '@utils/Time';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortColors} from '@components/ComponentUtils';
import {CircleSnail} from 'react-native-progress';

const AudioBubble = ({
  message,
  handleDownload,
  handlePress,
  handleLongPress,
}: {
  message: SavedMessageParams;
  handleDownload: (x: string) => Promise<void>;
  handlePress: any;
  handleLongPress: any;
}) => {
  const [fileUri, setfileUri] = useState<string | undefined>(undefined);
  const [downloading, setDownloading] = useState(false);
  const handleLongPressFunction = () => {
    handleLongPress(message.messageId);
  };

  useEffect(() => {
    setfileUri(getSafeAbsoluteURI(message?.data?.fileUri, 'doc'));
  }, [message?.data?.fileUri]);
  const durationTime = message?.data?.duration;

  const triggerDownload = async () => {
    setDownloading(true);
    await handleDownload(message.messageId);
    setDownloading(false);
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playTime, setPlayTime] = useState(formatDuration(durationTime));

  const {onStartPlay, onStopPlayer, currentlyPlaying, clearRecordingListeners} =
    useAudioPlayerContext();

  const startPlay = (fileUri, setPlayTime, setProgress) => {
    onStartPlay(setProgress, setPlayTime, fileUri);
  };

  const handleStartPlay = () => {
    if (message.data?.fileUri !== null) {
      setIsPlaying(p => !p);
      clearRecordingListeners();
      startPlay(fileUri, setPlayTime, setProgress);
    } else {
      triggerDownload();
    }
  };

  useEffect(() => {
    if (currentlyPlaying !== fileUri) {
      setIsPlaying(false);
      setProgress(0);
    }
  }, [currentlyPlaying, fileUri, isPlaying]);

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
        {message.data?.fileUri === null ? (
          !downloading ? (
            <Pressable onPress={handleStartPlay}>
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
              size={20}
              thickness={2}
              color={PortColors.primary.blue.app}
              duration={500}
            />
          )
        ) : isPlaying ? (
          <Pressable
            hitSlop={{top: 20, right: 20, left: 10, bottom: 20}}
            onPress={() => {
              setIsPlaying(p => !p);
              onStopPlayer();
            }}>
            <Pause style={{marginRight: 8}} />
          </Pressable>
        ) : (
          <Pressable
            hitSlop={{top: 20, right: 20, left: 10, bottom: 20}}
            onPress={handleStartPlay}>
            <Play style={{marginRight: 8}} />
          </Pressable>
        )}

        <ProgressBar progress={progress} setIsPlaying={setIsPlaying} />
      </View>
      <View style={styles.isMessageStyle}>
        <NumberlessText
          style={{
            color: PortColors.primary.grey.dark,
          }}
          fontSizeType={FontSizeType.s}
          fontType={FontType.rg}>
          {playTime}
        </NumberlessText>
      </View>
      {renderTimeStamp(message)}
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
