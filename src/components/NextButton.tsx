/**
 * styled next button
 */
import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';
import Next from '@assets/navigation/nextButton.svg';

export const NextButton: React.FC<TouchableOpacityProps> = ({
  onPress,
  style,
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={StyleSheet.compose(styles.button, style)}
      onPress={onPress}
      {...rest}>
      <Next width={24} height={24} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#547CEF',
    height: 65,
    width: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});
