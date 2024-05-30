/**
 * Line Separator.
 * Takes no props.
 */

import DynamicColors from '@components/DynamicColors';
import React from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';

const LineSeparator = () => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <View
      style={{
        height: 9,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary.surface,
      }}>
      <View style={styles.lineWrapper} />
    </View>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    lineWrapper: {
      marginHorizontal: 16,
      alignSelf: 'stretch',
      height: 0.5,
      backgroundColor: colors.primary.stroke,
    },
  });

export default LineSeparator;
