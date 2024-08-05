import {screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

// this is an ui element for showing progress in a bar

const ProgressBar = ({
  progress,
  setIsPlaying,
  isSender,
}: {
  isSender: boolean;
  progress: number;
  setIsPlaying: (p: boolean) => void;
}) => {
  // if bar has reached the end, set playing to false
  useEffect(() => {
    if (progress >= 1) {
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const Colors = DynamicColors();
  const styles = styling(Colors, isSender);

  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, {width: `${progress * 100}%`}]} />
    </View>
  );
};

const styling = (colors: any, isSender: boolean) =>
  StyleSheet.create({
    container: {
      width: screen.width - 180,
      height: 5,
      backgroundColor: isSender
        ? colors.progress.senderContainer
        : colors.progress.container,
      borderRadius: 6,
      overflow: 'hidden',
      marginRight: 8,
    },
    progressBar: {
      height: '100%',
      backgroundColor: isSender
        ? colors.progress.senderBar
        : colors.progress.bar,
    },
  });

export default ProgressBar;
