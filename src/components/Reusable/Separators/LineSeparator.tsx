/**
 * Line Separator.
 * Takes no props.
 */

import {PortColors} from '@components/ComponentUtils';
import React from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';

const LineSeparator = () => {
  return (
    <View
      style={{
        height: 9,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PortColors.primary.white,
      }}>
      <View style={styles.lineWrapper} />
    </View>
  );
};

const styles = StyleSheet.create({
  lineWrapper: {
    marginHorizontal: 16,
    alignSelf: 'stretch',
    height: 0.5,
    backgroundColor: PortColors.stroke,
  },
});

export default LineSeparator;
