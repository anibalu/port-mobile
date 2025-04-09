import React from 'react';
import {StyleSheet, View,ViewStyle} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import {useColors} from '@components/colorGuide';
import {Height} from '@components/spacingGuide';

/**
 * A line separator component that can be used to separate sections of a screen.
 *
 * @param borderColor - The color of the line separator.
 * @param forceTheme - The theme to use for the line separator.
 */
const LineSeparator = ({
  borderColor,
  gradient1borderColor = 'rgba(255, 255, 255, 0)',
  gradient2borderColor = 'rgba(255, 255, 255, 0.25)',
  forceTheme,
  style,
}: {
  borderColor?: string;
  gradient1borderColor?: string;
  gradient2borderColor?: string;
  forceTheme?: 'light' | 'dark';
  style?: ViewStyle;
}) => {
  const Colors = useColors(forceTheme);
  return Colors.theme === 'dark' ? (
    <View
      style={{
        height: style && style.height ? style.height : Height.lineSeparator,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}>
      <LinearGradient
        colors={[
          gradient1borderColor,
          gradient2borderColor,
          gradient1borderColor,
        ]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={StyleSheet.compose(styles.lineWrapper, {
          ...style,
        })}
      />
    </View>
  ) : (
    <View
      style={{
        height: style && style.height ? style.height : Height.lineSeparator,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}>
      <View
        style={StyleSheet.compose(styles.lineWrapper, {
          ...style,
          backgroundColor: borderColor || Colors.stroke,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  lineWrapper: {
    height: 0.5,
    width: '100%',
  },
});

export default LineSeparator;
