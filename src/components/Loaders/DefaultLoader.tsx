/**
 * Simple circle loader
 */

import React from 'react';

import {CircleSnail} from 'react-native-progress';

import {Colors} from '@components/colorGuide';

const DefaultLoader = ({color = Colors.common.black}: {color?: string}) => {
  return <CircleSnail color={color} duration={500} />;
};

export default DefaultLoader;
