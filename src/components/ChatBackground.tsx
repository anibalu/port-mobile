import React, {memo} from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import {isIOS} from './ComponentUtils';

const ChatBackground = () => {
  return (
    <ImageBackground
      source={require('@assets/backgrounds/puzzle.png')}
      style={styles.background}
    />
  );
};

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: isIOS ? '110%' : '100%',
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#FFF',
    opacity: 0.5,
    overflow: 'hidden',
  },
});

export default memo(ChatBackground);
