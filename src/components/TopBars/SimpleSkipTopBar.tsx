import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import { Colors } from '@components/colorGuide';
import { FontSizeType, FontWeight, NumberlessText } from '@components/NumberlessText';
import { Height, Spacing, Width } from '@components/spacingGuide';
/**
 * A simple top bar component with a skip button that adapts to light/dark theme.
 *
 * Features:
 * - Renders a skip button icon that works in both light and dark themes
 * - Uses LinearGradient background in dark theme
 * - Uses solid purple background in light theme
 * - Consistent height and spacing based on design system
 * - Pressable Skip button with increased hit area for better UX
 *
 * @param onSkipPress - Callback function when skip button is pressed
 * @param theme - Current theme (light/dark) to determine styling
 */

const SimpleSkipTopBar = ({
  onSkipPress,
  theme,
}: {
  onSkipPress: () => void;
  theme: 'light' | 'dark';
}) => {
  return theme === 'light' ? (
    <View
      style={{
        ...styles.topbarContainer,
        backgroundColor: Colors.light.purple,
      }}>
      <Pressable onPress={onSkipPress} hitSlop={20} style={{ marginRight: Spacing.l }}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontWeight={FontWeight.md}
          textColor={Colors.common.white}>
          SKIP
        </NumberlessText>
      </Pressable>
    </View>
  ) : (
    <LinearGradient
      colors={[Colors.dark.purpleGradient[0], Colors.dark.purpleGradient[1]]}
      style={styles.topbarContainer}>
      <Pressable onPress={onSkipPress} hitSlop={20} style={{ marginRight: Spacing.l }}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontWeight={FontWeight.md}
          textColor={Colors.common.white}>
          SKIP
        </NumberlessText>
      </Pressable>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  topbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Height.topbar,
    width: Width.screen,
    justifyContent: 'flex-end',
  },
});

export default SimpleSkipTopBar;
