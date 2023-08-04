/*
custom text bar for Numberless that uses Rubik font
*/
import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';

export const NumberlessRegularText = ({children, style, ...rest}) => (
  <Text style={StyleSheet.compose(styles.regular, style)} {...rest}>
    {children}
  </Text>
);

export const NumberlessItalicText = ({children, style, ...rest}) => (
  <Text style={StyleSheet.compose(styles.italic, style)} {...rest}>
    {children}
  </Text>
);

export const NumberlessBoldText = ({children, style, ...rest}) => (
  <Text style={StyleSheet.compose(styles.bold, style)} {...rest}>
    {children}
  </Text>
);

export const NumberlessClickableText = ({
  children,
  style,
  onPress,
  ...rest
}) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={StyleSheet.compose(styles.clickable, style)} {...rest}>
      {children}
    </Text>
  </TouchableOpacity>
);

export const NumberlessMediumText = ({children, style, ...rest}) => (
  <Text style={StyleSheet.compose(styles.medium, style)} {...rest}>
    {children}
  </Text>
);

export const NumberlessSemiBoldText = ({children, style, ...rest}) => (
  <Text style={StyleSheet.compose(styles.semibold, style)} {...rest}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  regular: {
    color: '#747474',
    fontFamily: 'Rubik-Regular',
    fontSize: 15,
  },
  bold: {
    color: '#547CEF',
    fontFamily: 'Rubik-Bold',
    fontSize: 17,
  },
  medium: {
    color: '#000000',
    fontFamily: 'Rubik-Medium',
    fontSize: 17,
  },
  semibold: {
    color: '#18191F',
    fontFamily: 'Rubik-SemiBold',
    fontSize: 17,
  },
  clickable: {
    color: '#747474',
    fontFamily: 'Rubik-Regular',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  italic: {
    color: '#000000',
    fontFamily: 'Rubik-LightItalic',
    fontSize: 17,
  },
});
