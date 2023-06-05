import React from 'react';
import {StyleSheet, Pressable} from 'react-native';
import {NumberlessMediumText} from '../../components/NumberlessText';

export function Button({children, onPress, style}) {
  return (
    <Pressable
      style={StyleSheet.compose(styles.button, style)}
      onPress={onPress}>
      <NumberlessMediumText style={styles.text}>
        {children}
      </NumberlessMediumText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#547CEF',
    borderRadius: 16,
    padding: 15,
  },
  text: {
    fontSize: 17,
    color: '#FFFFFF',
  },
});
