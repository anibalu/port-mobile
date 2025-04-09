import React from 'react';
import {View} from 'react-native';

import {CircleSnail} from 'react-native-progress';

import {useThemeColors} from '@components/colorGuide';

const SmallLoader = ({
  size = 24,
  theme,
  color,
}: {
  size?: number;
  theme: 'light' | 'dark';
  color?: string;
}) => {
  const Colors = useThemeColors(theme);

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <CircleSnail
        thickness={2}
        size={size}
        color={color || Colors.stroke}
        duration={500}
      />
    </View>
  );
};

export default SmallLoader;
