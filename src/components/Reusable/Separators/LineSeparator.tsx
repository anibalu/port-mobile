/**
 * Line Separator.
 * Takes no props.
 */

import DynamicColors from '@components/DynamicColors';
import React from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';

const LineSeparator = ({
  fromContactBubble = false,
}: {
  fromContactBubble?: boolean;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors, fromContactBubble);

  return (
    <View
      style={{
        height: 9,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View style={styles.lineWrapper} />
    </View>
  );
};

const styling = (colors: any, fromContactBubble: boolean) =>
  StyleSheet.create({
    lineWrapper: {
      marginHorizontal: fromContactBubble ? 0 : 16,
      alignSelf: 'stretch',
      height: 0.5,
      backgroundColor: colors.primary.stroke,
    },
  });

export default LineSeparator;
