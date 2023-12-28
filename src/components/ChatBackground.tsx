import React, {ReactNode, memo} from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import {screen} from './ComponentUtils';

const ChatBackground = ({standard = true}): ReactNode => {
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
    width: screen.width,
    height: screen.height,
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#FFF',
    opacity: 0.5,
  },
  background2: {
    width: screen.width,
    height: screen.height,
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#EEE',
    opacity: 0.5,
  },
});

export default memo(ChatBackground);
