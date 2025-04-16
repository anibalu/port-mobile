import React from 'react';
import {View} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import {Colors} from '@components/colorGuide';
import {FontSizeType, FontWeight,NumberlessText} from '@components/NumberlessText';
import {Spacing} from '@components/spacingGuide';

/**
 * TopBarDescription component displays a description text below the title in the top bar.
 * It adapts its appearance based on the theme (light/dark).
 *
 * @param description - The descriptive text to display
 * @param theme - The current theme (light/dark) to determine styling
 * @returns A themed description section with the provided text
 *
 * In light theme:
 * - Purple background
 * - White text
 *
 * In dark theme:
 * - Purple gradient background (fading from darker to lighter)
 * - White text
 *
 * The description text will wrap naturally within the fixed height container.
 * Uses a larger font size than the title for better readability of longer text.
 */

const TopBarDescription = ({
  description,
  theme,
}: {
  description?: string;
  theme: 'light' | 'dark';
}) => {
  return theme === 'light' ? (
    <View
      style={{
        backgroundColor: Colors.light.purple,
        paddingBottom: Spacing.xxxl,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
      }}>
      <NumberlessText
        style={{marginHorizontal: Spacing.l}}
        textColor={Colors.common.white}
        fontSizeType={FontSizeType.l}
        fontWeight={FontWeight.rg}>
        {description || '\n\n'}
      </NumberlessText>
    </View>
  ) : (
    <LinearGradient
      colors={[Colors.dark.purpleGradient[2], Colors.dark.purpleGradient[3]]}
      style={{paddingBottom: Spacing.xxxl}}>
      <NumberlessText
        style={{marginHorizontal: Spacing.l}}
        textColor={Colors.common.white}
        fontSizeType={FontSizeType.l}
        fontWeight={FontWeight.rg}>
        {description || '\n\n'}
      </NumberlessText>
    </LinearGradient>
  );
};

export default TopBarDescription;
