import React from 'react';
import {View} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import {Colors} from '@components/colorGuide';
import {FontSizeType, FontWeight,NumberlessText} from '@components/NumberlessText';
import {Height, Spacing} from '@components/spacingGuide';

/**
 * TopBarTitle component displays a title in the top bar of the app.
 * It adapts its appearance based on the theme (light/dark).
 *
 * @param title - The text to display in the top bar
 * @param theme - The current theme (light/dark) to determine styling
 * @returns A themed title bar with the provided text
 *
 * In light theme:
 * - Purple background
 * - White text
 *
 * In dark theme:
 * - Purple gradient background
 * - White text
 *
 * The title text will be truncated with ellipsis if it's too long to fit.
 */

const TopBarTitle = ({
  title,
  theme,
}: {
  title?: string;
  theme: 'light' | 'dark';
}) => {
  return theme === 'light' ? (
    <View
      style={{
        height: Height.title,
        backgroundColor: Colors.light.purple,
        paddingHorizontal: Spacing.l,
      }}>
      <NumberlessText
        textColor={Colors.common.white}
        fontSizeType={FontSizeType.es}
        fontWeight={FontWeight.md}
        numberOfLines={1}
        ellipsizeMode="tail">
        {title || ''}
      </NumberlessText>
    </View>
  ) : (
    <LinearGradient
      colors={[Colors.dark.purpleGradient[1], Colors.dark.purpleGradient[2]]}
      style={{height: Height.title, paddingHorizontal: Spacing.l}}>
      <NumberlessText
        textColor={Colors.common.white}
        fontSizeType={FontSizeType.es}
        fontWeight={FontWeight.md}
        numberOfLines={1}
        ellipsizeMode="tail">
        {title || ''}
      </NumberlessText>
    </LinearGradient>
  );
};

export default TopBarTitle;
