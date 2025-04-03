import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from 'src/context/ThemeContext';
import {Height, Spacing, Width} from '@components/spacingGuide';
import {Colors} from '@components/colorGuide';
import {ThemeType} from '@utils/Themes';
/**
 * Simple back top bar.
 * @param onBackPress - The function to call when the back button is pressed.
 */
const SimpleBackTopBar = ({onBackPress}: {onBackPress: () => void}) => {
  const svgArray = [
    {
      assetName: 'DynamicBackIcon',
      light: require('@assets/dark/icons/navigation/BlackArrowLeftThin.svg')
        .default,
      dark: require('@assets/dark/icons/navigation/BlackArrowLeftThin.svg')
        .default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const DynamicBackIcon = results.DynamicBackIcon;
  /**
   * Theme for the top bar.
   */
  const {themeValue} = useTheme();
  /**
   * If the theme is light, return the simple back top bar.
   */
  if (themeValue === ThemeType.light) {
    return (
      <View
        style={[
          styles.topbarContainer,
          {backgroundColor: Colors.light.purple},
        ]}>
        <Pressable onPress={onBackPress} hitSlop={20}>
          <DynamicBackIcon />
        </Pressable>
      </View>
    );
  } else {
    return (
      <LinearGradient
        colors={[Colors.dark.purpleGradient[0], Colors.dark.purpleGradient[1]]}
        style={styles.topbarContainer}>
        <Pressable onPress={onBackPress} hitSlop={20}>
          <DynamicBackIcon />
        </Pressable>
      </LinearGradient>
    );
  }
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

export default SimpleBackTopBar;
