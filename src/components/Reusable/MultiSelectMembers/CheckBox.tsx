/**
 * Simple CheckBox.
 * Needs to be nested in a pressable
 */

import React from 'react';
import {View} from 'react-native';
import Checked from '@assets/miscellaneous/checked.svg';
import Unchecked from '@assets/miscellaneous/unchecked.svg';

const CheckBox = ({value}: {value: boolean}) => {
  return <View>{value ? <Checked /> : <Unchecked />}</View>;
};

export default CheckBox;
