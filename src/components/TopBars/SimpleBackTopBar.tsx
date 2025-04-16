import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import {Colors} from '@components/colorGuide';
import {Height, Spacing, Width} from '@components/spacingGuide';

import BackIcon from '@assets/dark/icons/navigation/BlackArrowLeftThin.svg';

/**
 * A simple top bar component with a back button that adapts to light/dark theme.
 *
 * Features:
 * - Renders a back button icon that works in both light and dark themes
 * - Uses LinearGradient background in dark theme
 * - Uses solid purple background in light theme
 * - Consistent height and spacing based on design system
 * - Pressable back button with increased hit area for better UX
 *
 * @param onBackPress - Callback function when back button is pressed
 * @param theme - Current theme (light/dark) to determine styling
 */

const SimpleBackTopBar = ({
  onBackPress,
  theme,
}: {
  onBackPress: () => void;
  theme: 'light' | 'dark';
}) => {
  return theme === 'light' ? (
    <View
      style={{
        ...styles.topbarContainer,
        backgroundColor: Colors.light.purple,
      }}>
      <Pressable onPress={onBackPress} hitSlop={20} style={{marginLeft: Spacing.m}}>
        <BackIcon />
      </Pressable>
    </View>
  ) : (
    <LinearGradient
      colors={[Colors.dark.purpleGradient[0], Colors.dark.purpleGradient[1]]}
      style={styles.topbarContainer}>
      <Pressable onPress={onBackPress} hitSlop={20} style={{marginLeft: Spacing.m}}>
        <BackIcon />
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
    justifyContent: 'flex-start',
  },
});

export default SimpleBackTopBar;
