/**
 * Simple circle loader
 */

import React from 'react';

import {CircleSnail} from 'react-native-progress';

import {PortColors} from '@components/ComponentUtils';

const DefaultLoader = ({
  color = PortColors.primary.black,
}: {
  color?: string;
}) => {
  return <CircleSnail color={color} duration={500} />;
};

export default DefaultLoader;
