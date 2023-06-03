import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import Next from '../../assets/navigation/nextButton.svg';

export const NextButton = props => {
  return (
    <TouchableOpacity
      style={StyleSheet.compose(styles.button, props.style)}
      onPress={props.onPress}>
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
