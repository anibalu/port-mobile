import React from 'react';
import {Pressable, StyleSheet, View, ViewStyle} from 'react-native';

import {Height, Spacing, Width} from '@components/spacingGuide';

import BackIconDark from '@assets/dark/icons/navigation/BlackArrowLeftThin.svg';
import BackIconLight from '@assets/light/icons/navigation/BlackArrowLeftThin.svg';

/**
 * A generic back top bar component that can be used in any screen.
 * It will render a back icon that works in both light and dark themes.
 * The background color can be passed in as a prop.
 * @param onBackPress - Callback function when back button is pressed
 * @param theme - Current theme (light/dark) to determine styling
 * @param backgroundColor - Background color of the top bar
 * @returns A back top bar component
 */
const GenericBackTopBar = ({
  onBackPress,
  theme,
  backgroundColor,
  style,
}: {
  onBackPress?: () => void;
  theme: 'light' | 'dark';
  backgroundColor?: string;
  style?: ViewStyle;
}) => {
  return theme === 'light' ? (
    <View
      style={{
        ...styles.topbarContainer,
        backgroundColor: backgroundColor || 'transparent',
        ...style,
      }}>
      {onBackPress && (
        <Pressable onPress={onBackPress} hitSlop={20}>
          <BackIconLight />
        </Pressable>
      )}
    </View>
  ) : (
    <View
      style={{
        ...styles.topbarContainer,
        backgroundColor: backgroundColor || 'transparent',
        ...style,
      }}>
      {onBackPress && (
        <Pressable onPress={onBackPress} hitSlop={20}>
          <BackIconDark />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topbarContainer: {
    flexDirection: 'row',
    paddingLeft: Spacing.m,
    alignItems: 'center',
    height: Height.topbar,
    width: Width.screen,
    justifyContent: 'flex-start',
  },
});

export default GenericBackTopBar;
