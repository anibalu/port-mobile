import React, {useState, useEffect} from 'react';
import {Animated, Easing} from 'react-native';

const BlinkingDot = () => {
  const [animation] = useState(new Animated.Value(0));
  const [color, setColor] = useState('white');

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color,
    opacity: animation,
  };

  return <Animated.View style={dotStyle} />;
};

export default BlinkingDot;
