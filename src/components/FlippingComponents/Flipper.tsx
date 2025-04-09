import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const Flipper = ({
  FrontElement,
  BackElement,
  onFlipPress = () => {},
}: {
  FrontElement: ({flipCard}: {flipCard: () => void}) => React.JSX.Element;
  BackElement: ({flipCard}: {flipCard: () => void}) => React.JSX.Element;
  onFlipPress?: () => void;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotate = useSharedValue(0);
  const frontAnimatedStyles = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotate.value, [0, 1], [0, 180]);
    return {
      transform: [
        {
          rotateY: withTiming(`${rotateValue}deg`, {
            duration: 650,
            easing: Easing.inOut(Easing.back(2)),
          }),
        },
      ],
    };
  });
  const backAnimatedStyles = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotate.value, [0, 1], [180, 360]);
    return {
      transform: [
        {
          rotateY: withTiming(`${rotateValue}deg`, {
            duration: 650,
            easing: Easing.inOut(Easing.back(2)),
          }),
        },
      ],
    };
  });

  const flipCard = () => {
    rotate.value = rotate.value ? 0 : 1;
    setIsFlipped(!isFlipped);
    onFlipPress();
  };

  return (
    <View>
      <View>
        <Animated.View
          style={[styles.front, frontAnimatedStyles]}
          pointerEvents={isFlipped ? 'none' : 'auto'}>
          <FrontElement flipCard={flipCard} />
        </Animated.View>
        <Animated.View
          style={[styles.backCard, backAnimatedStyles]}
          pointerEvents={isFlipped ? 'auto' : 'none'}>
          <BackElement flipCard={flipCard} />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  front: {
    position: 'absolute',
    backfaceVisibility: 'hidden',
    width: '100%',
  },
  backCard: {
    position: 'absolute',
    backfaceVisibility: 'hidden',
    width: '100%',
  },
});
export default Flipper;
