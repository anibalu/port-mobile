import React, {ReactNode, memo} from 'react';
import {ImageBackground, StyleSheet} from 'react-native';

import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import {screen} from './ComponentUtils';
import DynamicColors from './DynamicColors';

const ChatBackground = ({standard = true}): ReactNode => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'BackgroundImage',
      light: require('@assets/light/backgrounds/ChatBG.png'),
      dark: require('@assets/dark/backgrounds/ChatBG.png'),
    },
  ];
  const results = useDynamicSVG(svgArray);
  const BackgroundImage = results.BackgroundImage;

  return standard ? (
    <ImageBackground source={BackgroundImage} style={styles.background} />
  ) : (
    <ImageBackground source={BackgroundImage} style={styles.background2} />
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    background: {
      width: screen.width,
      height: screen.height + 50,
      position: 'absolute',
      resizeMode: 'cover',
      backgroundColor: colors.primary.background,
      opacity: 0.5,
    },
    background2: {
      width: screen.width,
      height: screen.height + 50,
      position: 'absolute',
      resizeMode: 'cover',
      backgroundColor: colors.primary.background,
      opacity: 0.5,
    },
  });

export default memo(ChatBackground);
