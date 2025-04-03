/**
 * Simple circle loader
 */

import {Colors} from '@components/colorGuide';
import React from 'react';
import {CircleSnail} from 'react-native-progress';

const DefaultLoader = ({color = Colors.common.black}: {color?: string}) => {
  return <CircleSnail color={color} duration={500} />;
};

export default DefaultLoader;
