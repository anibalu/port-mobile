import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import {Colors} from '@components/colorGuide';
import {Height, Size, Spacing, Width} from '@components/spacingGuide';

import Cross from '@assets/dark/icons/Cross.svg';
import Logo from '@assets/icons/WhitePortLogo.svg';

const PortLogoTopBar = ({
  onClosePress,
  theme,
}: {
  onClosePress: () => void;
  theme: 'light' | 'dark';
}) => {
  return theme === 'light' ? (
    <View style={styles.topbarContainer}>
      <View style={{marginLeft: Spacing.m}}>
      </View>
      <Logo />
      <Pressable onPress={onClosePress} style={{marginRight: Spacing.m}}>
        <Cross width={Size.l} height={Size.l} />
      </Pressable>
    </View>
  ) : (
    <LinearGradient
      colors={[Colors.dark.purpleGradient[0], Colors.dark.purpleGradient[1]]}
      style={styles.topbarContainer}>
      <View style={{marginLeft: Spacing.m}}>
      </View>
      <Logo />
      <Pressable onPress={onClosePress} style={{marginRight: Spacing.m}}>
        <Cross width={Size.l} height={Size.l} />
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
    justifyContent: 'space-between',
  },
});

export default PortLogoTopBar;
