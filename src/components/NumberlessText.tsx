/*
custom text bar for Numberless that uses Rubik font
*/
import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';

export const NumberlessRegularText = props => (
  <Text style={StyleSheet.compose(styles.regular, props.style)}>
    {props.children}
  </Text>
);

export const NumberlessBoldText = props => (
  <Text style={StyleSheet.compose(styles.bold, props.style)}>
    {props.children}
  </Text>
);

export const NumberlessClickableText = props => (
  <TouchableOpacity onPress={props.onPress}>
    <Text style={StyleSheet.compose(styles.clickable, props.style)}>
      {props.children}
    </Text>
  </TouchableOpacity>
);

export const NumberlessMediumText = props => (
  <Text style={StyleSheet.compose(styles.medium, props.style)}>
    {props.children}
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
  clickable: {
    color: '#747474',
    fontFamily: 'Rubik-Regular',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
