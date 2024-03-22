import React, {ReactNode, memo} from 'react';
import {ImageBackground, StyleSheet} from 'react-native';
import {PortColors, screen} from './ComponentUtils';

const ChatBackground = ({standard = true}): ReactNode => {
  return standard ? (
    <ImageBackground
      source={require('@assets/backgrounds/BG.png')}
      style={styles.background}
    />
  ) : (
    <ImageBackground
      source={require('@assets/backgrounds/BG.png')}
      style={styles.background2}
    />
  );
};

const styles = StyleSheet.create({
  background: {
    width: screen.width,
    height: screen.height + 30,
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: PortColors.background,
    opacity: 0.5,
  },
  background2: {
    width: screen.width,
    height: screen.height + 30,
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#FFF',
    opacity: 0.5,
  },
});

export default memo(ChatBackground);
