import DynamicColors from '@components/DynamicColors';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

const ProgressBar = ({progress, setIsPlaying}) => {
  useEffect(() => {
    if (progress >= 1) {
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, {width: `${progress * 100}%`}]} />
    </View>
  );
};

const styling = colors =>
  StyleSheet.create({
    container: {
      width: 185,
      height: 5,
      backgroundColor: colors.progress.container,
      borderRadius: 6,
      overflow: 'hidden',
      marginRight: 8,
    },
    progressBar: {
      height: '100%',
      backgroundColor: colors.progress.bar,
    },
  });

export default ProgressBar;
