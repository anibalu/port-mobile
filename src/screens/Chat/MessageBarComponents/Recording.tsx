import React, {useEffect, useState} from 'react';
import {Animated, Easing, View} from 'react-native';

// this is ui element for amplitude bars while an audio is being recorded

const AmplitudeBars = () => {
  const [animation1] = useState(new Animated.Value(1));
  const [animation2] = useState(new Animated.Value(0.5));

  // toggles the height of both bars at 500 ms intervals
  useEffect(() => {
    const animate = () => {
      // animation to shorten height
      Animated.sequence([
        Animated.timing(animation1, {
          toValue: 0.5,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // animation to elongate height
        Animated.timing(animation1, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        animate();
      });
    };

    animate();

    return () => {
      animation1.stopAnimation();
      animation2.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // returns 6 bars that are changing heights
  return (
    <View style={{flexDirection: 'row'}}>
      <Animated.View
        style={{
          width: 2,
          height: 20,
          backgroundColor: '#6A35FF',
          marginRight: 3,
          transform: [{scaleY: animation1}],
        }}
      />
      <Animated.View
        style={{
          width: 2,
          height: 20,
          backgroundColor: '#6A35FF',
          marginRight: 3,
          transform: [{scaleY: animation2}],
        }}
      />
      <Animated.View
        style={{
          width: 2,
          height: 20,
          backgroundColor: '#6A35FF',
          marginRight: 3,
          transform: [{scaleY: animation1}],
        }}
      />
      <Animated.View
        style={{
          width: 2,
          height: 20,
          backgroundColor: '#6A35FF',
          marginRight: 3,
          transform: [{scaleY: animation2}],
        }}
      />
      <Animated.View
        style={{
          width: 2,
          height: 20,
          backgroundColor: '#6A35FF',
          marginRight: 3,
          transform: [{scaleY: animation1}],
        }}
      />
      <Animated.View
        style={{
          width: 2,
          height: 20,
          backgroundColor: '#6A35FF',
          transform: [{scaleY: animation2}],
        }}
      />
    </View>
  );
};

export default AmplitudeBars;
