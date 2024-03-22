import React, {useState, useEffect} from 'react';
import {View, Animated, Easing} from 'react-native';

const AmplitudeBars = () => {
  const [animation1] = useState(new Animated.Value(1));
  const [animation2] = useState(new Animated.Value(0.5));

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animation1, {
          toValue: 0.5,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
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

  return (
    <View style={{flexDirection: 'row'}}>
      <Animated.View
        style={{
          width: 2,
          height: 20,
          backgroundColor: '#547CEF',
          marginRight: 3,
          transform: [{scaleY: animation1}],
        }}
      />
      <Animated.View
        style={{
          width: 2,
          height: 20,
          backgroundColor: '#547CEF',
          marginRight: 3,
          transform: [{scaleY: animation2}],
        }}
      />
      <Animated.View
        style={{
          width: 2,
          height: 20,
          backgroundColor: '#547CEF',
          marginRight: 3,
          transform: [{scaleY: animation1}],
        }}
      />
      <Animated.View
        style={{
          width: 2,
          height: 20,
          backgroundColor: '#547CEF',
          marginRight: 3,
          transform: [{scaleY: animation2}],
        }}
      />
      <Animated.View
        style={{
          width: 2,
          height: 20,
          backgroundColor: '#547CEF',
          marginRight: 3,
          transform: [{scaleY: animation1}],
        }}
      />
      <Animated.View
        style={{
          width: 2,
          height: 20,
          backgroundColor: '#547CEF',
          transform: [{scaleY: animation2}],
        }}
      />
    </View>
  );
};

export default AmplitudeBars;
