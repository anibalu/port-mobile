/**
 * Simple circle loader
 */

import React from 'react';
import {PortColors} from '@components/ComponentUtils';
import {CircleSnail} from 'react-native-progress';

const DefaultLoader = ({
  color = PortColors.primary.black,
}: {
  color?: string;
}) => {
  return <CircleSnail color={color} duration={500} />;
};

export default DefaultLoader;
