/**
 * Line Separator.
 * Takes no props.
 */

import {PortColors} from '@components/ComponentUtils';
import React from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';

const LineSeparator = () => {
  return <View style={styles.lineWrapper} />;
};

const styles = StyleSheet.create({
  lineWrapper: {
    marginHorizontal: 16,
    alignSelf: 'stretch',
    borderColor: PortColors.stroke,
    borderBottomWidth: 0.5,
  },
});

export default LineSeparator;
