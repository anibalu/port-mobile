import {PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {TOPBAR_HEIGHT} from '@configs/constants';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Logo from '@assets/icons/WhitePortLogo.svg';
import Settings from '@assets/dark/icons/Settings.svg';
import Cross from '@assets/dark/icons/Cross.svg';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from 'src/context/ThemeContext';

/**
 * Accent Back Top Bar With Button component
 * @param onBackPress - The function to call when the back button is pressed
 * @returns {React.ReactElement}
 */

const AccentBackTopBarWithButton = ({
  onBackPress,
}: {
  onBackPress: () => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const {themeValue} = useTheme();

  if (themeValue === 'light') {
    return (
      <View style={styles.topbarContainer}>
        <Settings />
        <Logo />
        {onBackPress && (
          <Pressable onPress={onBackPress}>
            <Cross width={24} height={24} />
          </Pressable>
        )}
      </View>
    );
  } else {
    return (
      <LinearGradient
        colors={['#240A6F', '#4513D5']}
        style={styles.topbarContainer}>
        <Settings />
        <Logo />
        {onBackPress && (
          <Pressable onPress={onBackPress}>
            <Cross width={24} height={24} />
          </Pressable>
        )}
      </LinearGradient>
    );
  }
};

const styling = (Color: any) =>
  StyleSheet.create({
    topbarContainer: {
      flexDirection: 'row',
      paddingHorizontal: PortSpacing.secondary.uniform,
      alignItems: 'center',
      backgroundColor: Color.primary.accent,
      height: TOPBAR_HEIGHT,
      width: screen.width,
      justifyContent: 'space-between',
    },
  });
export default AccentBackTopBarWithButton;
