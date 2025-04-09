import React from 'react';
import {StatusBar, StatusBarProps, View} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {isIOS} from './ComponentUtils';

/**
 * Status bar for the entire app.
 * Handles IOS and android whether notch exists or not.
 * @param backgroundColor - pass this prop ONLY if no back button should be shown. This absolutely positions the element for welcome page
 * @param theme - pass this prop to set the theme of the status bar. Default is light.
 * @returns Status bar
 */

export interface CustomStatusBarProps extends StatusBarProps {
  backgroundColor?: string;
  theme?: 'light' | 'dark';
}

export const CustomStatusBar = ({
  backgroundColor = 'transparent',
  theme = 'light',
  ...props
}: CustomStatusBarProps) => {
  const insets = useSafeAreaInsets();

  return isIOS ? (
    <View
      style={{
        height: insets.top,
        backgroundColor: backgroundColor,
      }}
    />
  ) : (
    <StatusBar
      translucent={true}
      backgroundColor={backgroundColor}
      {...props}
      barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
    />
  );
};
