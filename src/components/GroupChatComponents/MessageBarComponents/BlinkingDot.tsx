import React, {useEffect, useState} from 'react';
import {Animated, Easing} from 'react-native';

// this is a ui element for a blinking dot used for audio recording

const BlinkingDot = () => {
  const [animation] = useState(new Animated.Value(0));
  // to set color from red to white and vice versa

  const [color, setColor] = useState('white');

  useEffect(() => {
    // animation for blinking every 1 second
    const animate = () => {
      // makes dot appear
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // makes dot disappear
        Animated.timing(animation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setColor(color === 'red' ? 'white' : 'red');
        animate();
      });
    };

    animate();

    return () => {
      animation.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dotStyle = {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color,
    opacity: animation,
  };

  return <Animated.View style={dotStyle} />;
};

export default BlinkingDot;
