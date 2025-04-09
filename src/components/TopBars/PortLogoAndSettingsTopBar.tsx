import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import {Colors} from '@components/colorGuide';
import {Height, Size, Spacing, Width} from '@components/spacingGuide';

import Cross from '@assets/dark/icons/Cross.svg';
import Settings from '@assets/dark/icons/Settings.svg';
import Logo from '@assets/icons/WhitePortLogo.svg';

const PortLogoAndSettingsTopBar = ({
  onSettingsPress,
  onClosePress,
  theme,
}: {
  onSettingsPress: () => void;
  onClosePress: () => void;
  theme: 'light' | 'dark';
}) => {
  return theme === 'light' ? (
    <View style={styles.topbarContainer}>
      <Pressable onPress={onSettingsPress}>
        <Settings width={Size.l} height={Size.l} />
      </Pressable>
      <Logo />
      <Pressable onPress={onClosePress}>
        <Cross width={Size.l} height={Size.l} />
      </Pressable>
    </View>
  ) : (
    <LinearGradient
      colors={[Colors.dark.purpleGradient[0], Colors.dark.purpleGradient[1]]}
      style={styles.topbarContainer}>
      <Pressable onPress={onSettingsPress}>
        <Settings width={Size.l} height={Size.l} />
      </Pressable>
      <Logo />
      <Pressable onPress={onClosePress}>
        <Cross width={Size.l} height={Size.l} />
      </Pressable>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  topbarContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.m,
    alignItems: 'center',
    height: Height.topbar,
    width: Width.screen,
    justifyContent: 'space-between',
  },
});

export default PortLogoAndSettingsTopBar;
