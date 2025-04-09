import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet} from 'react-native';

import {Thumbnail, createThumbnail} from 'react-native-create-thumbnail';
import LinearGradient from 'react-native-linear-gradient';
import VideoPlayer from 'react-native-video-player';

import {PortColors, isIOS, screen} from './ComponentUtils';
import DynamicColors from './DynamicColors';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';



const VideoView = ({
  fileUri,
  attachedText,
}: {
  fileUri: string;
  attachedText: string;
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const [startedPlaying, setStartedPlaying] = useState(false);
  const [showText, setShowText] = useState(true);
  const [thumbnail, setThumbnail] = useState<Thumbnail | null>(null);

  const toggleText = () => {
    setShowFullText(!showFullText);
  };

  useEffect(() => {
    (async () => {
      setThumbnail(
        await createThumbnail({
          url: fileUri,
          timeStamp: 0,
        }),
      );
    })();
  }, [fileUri]);

  const Colors = DynamicColors();
  const customStyles = {
    seekBarProgress: {
      backgroundColor: Colors.primary.accent,
      height: 5,
    },
    seekBarKnob: {
      backgroundColor: Colors.primary.accent,
    },
    seekBarBackground: {
      backgroundColor: Colors.primary.white,
      height: 5,
    },
    wrapper: {
      height: screen.height - 175,
    },
    videoWrapper: {
      height: screen.height - 175,
    },
    video: {
      height: screen.height - 175,
    },
  };

  return (
    <>
      <VideoPlayer
        onStart={() => {
          setShowText(false);
          setStartedPlaying(true);
        }}
        onPlayPress={() => setShowText(p => !p)}
        source={{
          uri: fileUri,
        }}
        muted={false}
        ignoreSilentSwitch="ignore"
        customStyles={customStyles}
        pauseOnPress
        videoWidth={screen.width}
        thumbnail={{uri: thumbnail?.path}}
      />
      {showText && attachedText && (
        <LinearGradient
          style={
            startedPlaying
              ? styles.gradientContainer
              : styles.gradientContainerWithoutControls
          }
          colors={['transparent', 'black']}>
          <ScrollView>
            {attachedText && (
              <Pressable onPress={toggleText}>
                {showFullText ? (
                  <NumberlessText
                    textColor={PortColors.primary.white}
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.rg}>
                    {attachedText}
                  </NumberlessText>
                ) : (
                  <NumberlessText
                    ellipsizeMode="tail"
                    numberOfLines={3}
                    textColor={PortColors.primary.white}
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.rg}>
                    {attachedText}
                  </NumberlessText>
                )}
              </Pressable>
            )}
          </ScrollView>
        </LinearGradient>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  videoView: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'red',
  },
  backgroundVideo: {
    flex: 1,
    width: '100%',
  },
  gradientContainerWithoutControls: {
    position: 'absolute',
    bottom: 70,
    marginRight: 10,
    paddingLeft: 17,
    width: screen.width,
    paddingTop: 20,
    paddingBottom: 10,
    maxHeight: 250,
  },
  gradientContainer: {
    position: 'absolute',
    ...(isIOS ? {bottom: 110} : {bottom: 140}),
    marginRight: 10,
    paddingLeft: 17,
    width: screen.width,
    paddingTop: 20,
    paddingBottom: 10,
    maxHeight: 250,
  },
});
export default VideoView;
