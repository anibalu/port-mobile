/**
 * Small blue loader
 */

import {PortColors} from '@components/ComponentUtils';
import React from 'react';
import {CircleSnail} from 'react-native-progress';
import {View} from 'react-native';

const SmallLoader = ({size = 24}: {size?: number}) => {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <CircleSnail
        thickness={2}
        size={size}
        color={PortColors.primary.blue.app}
        duration={500}
      />
    </View>
  );
};

export default SmallLoader;
