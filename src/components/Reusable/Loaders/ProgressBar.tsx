import {PortColors} from '@components/ComponentUtils';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

const ProgressBar = ({progress, setIsPlaying}) => {
  useEffect(() => {
    if (progress >= 1) {
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, {width: `${progress * 100}%`}]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 185,
    height: 5,
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: PortColors.primary.blue.app,
  },
});

export default ProgressBar;
