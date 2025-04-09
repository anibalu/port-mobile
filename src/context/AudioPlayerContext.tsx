import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import AudioRecorderPlayer, {
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';

type ModalContextType = {
  audio: string | null;
  duration: any;
  onStartPlay: (
    setProgress: (x: number) => void,
    setPlayTime: (x: string) => void,
    fileUri?: string,
  ) => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  deleteRecording: () => void;
  clearRecordingListeners: () => void;
  currentlyPlaying: string | undefined;
  onStopPlayer: () => void;
  setAudio: (audiorec: any) => void;
};

const AudioPlayerContext = createContext<ModalContextType | undefined>(
  undefined,
);

export const useAudioPlayerContext = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error(
      'useAudioPlayerContext must be used within a ModalProvider',
    );
  }
  return context;
};

type ModalProviderProps = {
  children: ReactNode;
};

//Defines how audio is recorded, with specified formats for iOS and Android
const audioSet: AudioSet = {
  OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
  AudioEncoderAndroid: AudioEncoderAndroidType.DEFAULT,
  AVFormatIDKeyIOS: AVEncodingOption.aac,
};

export const AudioPlayerProvider: React.FC<ModalProviderProps> = ({
  children,
}) => {
  // sets the instance of the record player
  const [recorderPlayer, setRecorderPlayer] =
    useState<AudioRecorderPlayer | null>(null);

  // sets the duration of the audio being recorded
  const [duration, setDuration] = useState(0);

  // stores the uri of the audio
  const [audio, setAudio] = useState<string | null>(null);

  useEffect(() => {
    const player = new AudioRecorderPlayer();
    setRecorderPlayer(player);

    return () => {
      if (player) {
        try {
          player.stopRecorder();
          player.removeRecordBackListener();
          player.removePlayBackListener();
        } catch {
          console.log('Error in cleanup');
        }
      }
    };
  }, []);

  // util to handle start recording
  const onStartRecord = async () => {
    if (recorderPlayer) {
      try {
        const msg = await recorderPlayer.startRecorder(
          undefined,
          audioSet,
          undefined,
        );

        recorderPlayer.addRecordBackListener(e => {
          // only set audio if the duration is more than a second
          if (e.currentPosition > 1000) {
            setAudio(msg);
          }
          setDuration(e.currentPosition);
        });
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    } else {
      console.log('No player attached');
    }
  };

  // util to handle stop recording
  const onStopRecord = async () => {
    try {
      if (recorderPlayer) {
        await recorderPlayer.stopRecorder();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const [listenRef, setListenRef] = useState<any>(undefined);

  // util to stop the player instance, incase we hadn't cleared the listener earlier
  const onStopPlayer = async () => {
    try {
      if (recorderPlayer) {
        await recorderPlayer.stopPlayer();
        if (listenRef) {
          await listenRef.remove();
        }
      }
    } catch {
      console.log('Error stopping player');
    }
  };

  // util to convert duration of milliseconds to MM:SS
  function convertToMMSS(inputString: string) {
    const parts = inputString.split(':');

    let minutes = parseInt(parts[0]);
    let seconds = parseInt(parts[1]);

    minutes += Math.floor(seconds / 60);
    seconds %= 60;

    const formattedString =
      (minutes < 10 ? '0' : '') +
      minutes +
      ':' +
      (seconds < 10 ? '0' : '') +
      seconds;

    return formattedString;
  }

  // sets the audio that is currently being played
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | undefined>(
    undefined,
  );

  // util to start playing any audio
  // first it stops any previous instance of a player
  // next it checks if there is any file uri being passed, if so, plays the particular audio ex in audio bubble
  // otherwise it plays the local audio file ex in message bar

  const onStartPlay = async (
    setProgress: (x: number) => void,
    setPlayTime: (x: string) => void,
    fileUri?: string,
  ) => {
    await onStopPlayer();
    if (recorderPlayer) {
      if (fileUri) {
        setCurrentlyPlaying(fileUri);
        try {
          await recorderPlayer.startPlayer(fileUri);
          const listener = recorderPlayer.addPlayBackListener(e => {
            setPlayTime(
              convertToMMSS(
                recorderPlayer.mmssss(Math.floor(e.currentPosition)),
              ),
            );
            setProgress(e.currentPosition / e.duration);
          });
          setListenRef(listener);
        } catch (error) {
          console.error('Error playing recording:', error);
        }
      } else {
        try {
          await recorderPlayer.startPlayer();
          recorderPlayer.addPlayBackListener(e => {
            setPlayTime(
              convertToMMSS(
                recorderPlayer.mmssss(Math.floor(e.currentPosition)),
              ),
            );
            setProgress(e.currentPosition / duration);
          });
        } catch (error) {
          console.error('Error playing recording:', error);
        }
      }
    } else {
      console.log('No recorder attached');
    }
  };

  // util to delete a recording
  const deleteRecording = async () => {
    try {
      if (recorderPlayer) {
        try {
          recorderPlayer.stopPlayer().finally(() => {
            setDuration(0);
          });
        } catch (error) {
          console.error('Error deleting recording:', error);
        }
      }
    } catch {
      console.log('Error deleting recording');
    }
  };

  // clears any unwanted recording listeners
  const clearRecordingListeners = async () => {
    try {
      if (recorderPlayer) {
        recorderPlayer.stopRecorder();
        recorderPlayer.removeRecordBackListener();
        recorderPlayer.removePlayBackListener();
      }
    } catch {
      console.log('Error clearing listeners');
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        duration,
        audio,
        currentlyPlaying,
        onStartPlay,
        onStartRecord,
        onStopRecord,
        deleteRecording,
        clearRecordingListeners,
        onStopPlayer,
        setAudio,
      }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
