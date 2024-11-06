import {PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import React, {useEffect, useMemo} from 'react';
import {StyleSheet, Animated, Easing} from 'react-native';

const FolderCardSkeletonTile = ({toggleOn}: {toggleOn: boolean}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const opacityAnimation = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    const initialDelay = Animated.sequence([
      Animated.delay(300), // One-time 300ms delay before animation starts
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnimation, {
            toValue: 0.5,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnimation, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    ]);

    initialDelay.start();

    return () => {
      initialDelay.stop();
    };
  }, [opacityAnimation]);

  return (
    <Animated.View
      style={StyleSheet.compose(styles.placeholder, {
        opacity: opacityAnimation,
        height: toggleOn ? 127 : 180,
        width: toggleOn
          ? screen.width - PortSpacing.primary.uniform
          : screen.width / 2 - 20,
      })}
    />
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    placeholder: {
      backgroundColor: colors.primary.surface,
      borderRadius: 16,
      paddingVertical: 0,
      marginBottom: PortSpacing.tertiary.uniform,
      borderColor: colors.primary.stroke,
      borderWidth: 0.5,
    },
  });
export default FolderCardSkeletonTile;
