/**
 * Line Separator.
 * Takes no props.
 */

import DynamicColors from '@components/DynamicColors';
import React from 'react';
import {StyleSheet,View} from 'react-native';

const LineSeparator = ({
  fromContactBubble = false,
  borderColor,
}: {
  fromContactBubble?: boolean;
  borderColor?: string;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors, fromContactBubble, borderColor);

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

const styling = (
  colors: any,
  fromContactBubble: boolean,
  borderColor: string = colors.primary.stroke,
) =>
  StyleSheet.create({
    lineWrapper: {
      marginHorizontal: fromContactBubble ? 0 : 16,
      alignSelf: 'stretch',
      height: 0.5,
      backgroundColor: borderColor,
    },
  });

export default LineSeparator;
