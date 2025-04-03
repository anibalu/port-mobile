import React from 'react';
import {View} from 'react-native';
import {SafeAreaView, SafeAreaViewProps} from './SafeAreaView';
import {CustomStatusBar} from './CustomStatusBar';
import {Colors} from './colorGuide';
import {ThemeType} from '@utils/Themes';
import {Height, Width} from './spacingGuide';
import TopBarTitle from './Text/TopBarTitle';
import SimpleBackTopBar from './TopBars/SimpleBackTopBar';

export interface GradientScreenViewProps extends SafeAreaViewProps {
  color: any;
  title?: string;
  containsEmptyTitleAndDescription?: boolean;
  onBackPress?: () => void;
}

/**
 * GradientScreenView is a screen container component that provides a consistent gradient background
 * and navigation structure across the app.
 *
 * Features:
 * - Adapts styling based on light/dark theme
 * - Includes a custom status bar that matches the theme
 * - Renders a back button and title in the header
 * - Creates a gradient effect with the top half of screen colored and bottom half transparent
 * - Safe area handling for different device notches/cutouts
 *
 * Props:
 * @param color - Theme color object containing theme type and background color
 * @param title - Text to display in the header
 * @param containsEmptyTitleAndDescription - Modifies default background color if title and description are empty
 * @param onBackPress - Callback function when back button is pressed
 * @param backgroundColor - Optional override for the background color
 * @param children - Child components to render within the screen
 */

export function GradientScreenView({
  children,
  color,
  title,
  containsEmptyTitleAndDescription = false,
  onBackPress,
  backgroundColor,
  ...rest
}: GradientScreenViewProps) {
  console.log('[Rendering GradientScreenView]');
  return (
    <>
      <CustomStatusBar
        theme={color.theme}
        backgroundColor={
          color.theme === ThemeType.light
            ? Colors.light.purple
            : Colors.dark.purpleGradient[0]
        }
      />
      <SafeAreaView
        backgroundColor={backgroundColor || color.background}
        {...rest}>
        <View
          style={{
            position: 'absolute',
            height: Height.screen,
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              height: Height.screen * 0.5,
              width: Width.screen,
              backgroundColor:
                color.theme === ThemeType.light
                  ? Colors.light.purple
                  : containsEmptyTitleAndDescription
                  ? Colors.dark.purpleGradient[1]
                  : Colors.dark.purpleGradient[2],
            }}
          />
          <View
            style={{
              height: Height.screen * 0.5,
              width: Width.screen,
              backgroundColor: 'transparent',
            }}
          />
        </View>
        {onBackPress && (
          <SimpleBackTopBar onBackPress={onBackPress} theme={color.theme} />
        )}
        {title && <TopBarTitle title={title} theme={color.theme} />}
        {children}
      </SafeAreaView>
    </>
  );
}
