import React, {useEffect, useRef} from 'react';
import {Animated, View, StyleSheet} from 'react-native';
import WhiteCheck from '@assets/icons/tick.svg';
import PortInitialLogo from '@assets/miscellaneous/PortInitialLogo.svg';
import UserCircle from '@assets/dark/icons/UserCircle.svg';
import DynamicColors from '@components/DynamicColors';
import {PortSpacing} from '@components/ComponentUtils';

const AnimatedProgressBar = ({
  screenIndex,
  maxScreenIndex,
}: {
  screenIndex: number;
  maxScreenIndex: number;
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  // Effect to animate the width whenever screenIndex changes
  useEffect(() => {
    const targetWidth = (screenIndex / maxScreenIndex) * 100;
    Animated.timing(animatedWidth, {
      toValue: targetWidth,
      duration: 500, // Smooth animation duration
      useNativeDriver: false,
    }).start();
  }, [screenIndex, maxScreenIndex, animatedWidth]);

  const Colors = DynamicColors();

  const styles = styling(Colors, screenIndex, maxScreenIndex);

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View
        style={[
          styles.progressBarWrapper,
          {
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}>
        {screenIndex === 1 ? (
          <PortInitialLogo height={20} width={20} />
        ) : screenIndex === maxScreenIndex ? (
          <WhiteCheck height={20} width={20} />
        ) : (
          <UserCircle height={20} width={20} />
        )}
      </Animated.View>
    </View>
  );
};

const styling = (colors, screenIndex, maxScreenIndex) =>
  StyleSheet.create({
    progressBarContainer: {
      marginHorizontal: PortSpacing.secondary.uniform,
      backgroundColor:
        screenIndex === maxScreenIndex
          ? colors.lowAccentColors.darkGreen
          : colors.lowAccentColors.blue,
      height: 40,
      overflow: 'hidden',
      marginBottom: PortSpacing.intermediate.bottom,
      borderRadius: PortSpacing.intermediate.uniform,
    },
    progressBarWrapper: {
      backgroundColor:
        screenIndex === maxScreenIndex
          ? colors.boldAccentColors.darkGreen
          : colors.boldAccentColors.blue,
      borderRadius: PortSpacing.intermediate.uniform,
      height: '100%',
      alignItems: 'flex-end',
      paddingRight: PortSpacing.medium.right,
      justifyContent: 'center',
    },
  });

export default AnimatedProgressBar;
