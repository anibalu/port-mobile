/**
 * Small blue loader
 */

import React from 'react';
import {View} from 'react-native';

import {CircleSnail} from 'react-native-progress';

import DynamicColors from '@components/DynamicColors';

const SmallLoader = ({size = 24}: {size?: number}) => {
  const Colors = DynamicColors();

  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <CircleSnail
        thickness={2}
        size={size}
        color={Colors.primary.accent}
        duration={500}
      />
    </View>
  );
};

export default SmallLoader;
