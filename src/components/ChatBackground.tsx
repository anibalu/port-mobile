import React, {memo} from 'react';
import {ImageBackground, StyleSheet} from 'react-native';

const ChatBackground = ({standard = true}) => {
  return standard ? (
    <ImageBackground
      source={require('@assets/backgrounds/puzzle.png')}
      style={styles.background}
    />
  ) : (
    <ImageBackground
      source={require('@assets/backgrounds/puzzle.png')}
      style={styles.background2}
    />
  );
};

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '110%',
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#FFF',
    opacity: 0.5,
    overflow: 'hidden',
  },
  background2: {
    width: '100%',
    height: '110%',
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#EEE',
    opacity: 0.5,
    overflow: 'hidden',
  },
});

export default memo(ChatBackground);
