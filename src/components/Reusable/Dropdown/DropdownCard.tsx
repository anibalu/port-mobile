import {PortSpacing} from '@components/ComponentUtils';
import React, {useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import DynamicColors from '@components/DynamicColors';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const DropdownCard = ({title, children}: {title: string; children: any}) => {
  const [isVisible, setIsVisible] = useState(false);
  const rotationValue = useRef(new Animated.Value(0)).current;

  const rotateInterpolation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const animatedStyle: Animated.AnimatedProps<ViewStyle> = {
    transform: [{rotate: rotateInterpolation}],
  };

  const toggleVisibility = (): void => {
    setIsVisible(!isVisible);

    Animated.timing(rotationValue, {
      toValue: isVisible ? 0 : 1,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  const Colors = DynamicColors();

  const svgArray = [
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const AngleRight = results.AngleRight;

  return (
    <SimpleCard style={styles.card}>
      <Pressable style={styles.button} onPress={toggleVisibility}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            // backgroundColor: 'red',
          }}>
          <NumberlessText
            textColor={Colors.text.primary}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.l}>
            {title}
          </NumberlessText>
          <Animated.View style={[styles.arrow, animatedStyle]}>
            <AngleRight />
          </Animated.View>
        </View>
      </Pressable>
      {isVisible && (
        <View
          style={{
            paddingTop: PortSpacing.secondary.uniform,
          }}>
          {children}
        </View>
      )}
    </SimpleCard>
  );
};
const styles = StyleSheet.create({
  arrow: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  card: {
    width: '100%',
    marginTop: PortSpacing.secondary.top,
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingVertical: PortSpacing.secondary.uniform,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
export default DropdownCard;
