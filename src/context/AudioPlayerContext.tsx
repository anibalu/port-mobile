import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

type ModalContextType = {
  audio: string | null;
  duration: any;
  progress: number;
  onPausePlay: () => void;
  onStartPlay: (
    setProgress: Function,
    setPlayTime: Function,
    fileUri?: string,
  ) => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  deleteRecording: () => void;
  clearRecordingListeners: () => void;
  currentlyPlaying: string;
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

export const AudioPlayerProvider: React.FC<ModalProviderProps> = ({
  children,
}) => {
  // sets the instance of the record player
  const [recorderPlayer, setRecorderPlayer] = useState(null);

  // sets the duration of the audio being recorded
  const [duration, setDuration] = useState(0);

  // stores the uri of the audio
  const [audio, setAudio] = useState<string | null>(null);

  useEffect(() => {
    const player = new AudioRecorderPlayer();
    setRecorderPlayer(player);

    return () => {
      if (player) {
        player.stopRecorder();
        player.removeRecordBackListener();
        player.removePlayBackListener();
      }
    };
  }, []);

  // util to handle start recording
  const onStartRecord = async () => {
    try {
      const msg = await recorderPlayer?.startRecorder();

      recorderPlayer?.addRecordBackListener(e => {
        // only set audio if the duration is more than a second
        if (e.currentPosition > 1000) {
          setAudio(msg);
        }
        setDuration(e.currentPosition);
      });
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // util to handle stop recording
  const onStopRecord = async () => {
    try {
      if (recorderPlayer) {
        await recorderPlayer?.stopRecorder();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const [listenRef, setListenRef] = useState<any>(undefined);

  // util to stop the player instance, incase we hadn't cleared the listener earlier
  const onStopPlayer = async () => {
    await recorderPlayer?.stopPlayer();
    if (listenRef) {
      await listenRef?.remove();
    }
  };

  // util to convert duration of milliseconds to MM:SS
  function convertToMMSS(inputString) {
    let parts = inputString.split(':');

    let minutes = parseInt(parts[0]);
    let seconds = parseInt(parts[1]);

    minutes += Math.floor(seconds / 60);
    seconds %= 60;

    let formattedString =
      (minutes < 10 ? '0' : '') +
      minutes +
      ':' +
      (seconds < 10 ? '0' : '') +
      seconds;

    return formattedString;
  }

  // sets the audio that is currently being played
  const [currentlyPlaying, setCurrentlyPlaying] = useState(undefined);

  // util to start playing any audio
  // first it stops any previous instance of a player
  // next it checks if there is any file uri being passed, if so, plays the particular audio ex in audio bubble
  // otherwise it plays the local audio file ex in message bar

  const onStartPlay = async (
    setProgress: any,
    setPlayTime: any,
    fileUri?: string,
  ) => {
    await onStopPlayer();

    if (fileUri) {
      setCurrentlyPlaying(fileUri);
      try {
        await recorderPlayer?.startPlayer(fileUri);
        const listener = recorderPlayer?.addPlayBackListener(e => {
          setPlayTime(
            convertToMMSS(
              recorderPlayer?.mmssss(Math.floor(e.currentPosition)),
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
        await recorderPlayer?.startPlayer();
        recorderPlayer?.addPlayBackListener(e => {
          setPlayTime(
            convertToMMSS(
              recorderPlayer?.mmssss(Math.floor(e.currentPosition)),
            ),
          );
          setProgress(e.currentPosition / duration);
        });
      } catch (error) {
        console.error('Error playing recording:', error);
      }
    }
  };
  // util to pause any audio
  const onPausePlay = async () => {
    try {
      await recorderPlayer?.pausePlayer();
    } catch (error) {
      console.error('Error pausing recording:', error);
    }
  };

  // util to delete a recording
  const deleteRecording = async () => {
    try {
      await recorderPlayer?.stopPlayer();

      setDuration(0);
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  // clears any unwanted recording listeners
  const clearRecordingListeners = async () => {
    recorderPlayer?.stopRecorder();
    recorderPlayer?.removeRecordBackListener();
    recorderPlayer?.removePlayBackListener();
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        duration,
        audio,
        currentlyPlaying,
        onPausePlay,
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
