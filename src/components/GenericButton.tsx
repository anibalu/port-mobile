import React, {ReactNode} from 'react';
import {StyleSheet, Pressable, View, TextStyle, ViewStyle} from 'react-native';
import {NumberlessMediumText} from './NumberlessText';
import {FontSizes, PortColors} from './ComponentUtils';

export function GenericButton({
  children,
  onPress,
  buttonStyle,
  textStyle,
  iconPosition = 'left',
  iconStyle,
  iconHeight,
  Icon,
}: {
  children?: React.ReactNode;
  onPress: any;
  iconPosition?: 'left' | 'right';
  iconStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  iconHeight?: number;
  Icon?: any;
}): ReactNode {
  return (
    <Pressable
      style={StyleSheet.compose(styles.button, buttonStyle)}
      onPress={onPress}>
      {Icon && iconPosition == 'left' ? (
        <View
          style={StyleSheet.compose(
            children ? {marginRight: 8} : {},
            iconStyle,
          )}>
          <Icon height={iconHeight ? iconHeight : 24} />
        </View>
      ) : null}
      {children ? (
        <NumberlessMediumText
          style={StyleSheet.compose(styles.text, textStyle)}>
          {children}
        </NumberlessMediumText>
      ) : null}
      {Icon && iconPosition == 'right' ? (
        <View
          style={StyleSheet.compose(
            children ? {marginLeft: 8} : {},
            iconStyle,
          )}>
          <Icon height={24} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PortColors.primary.blue.app,
    borderRadius: 16,
    padding: 15,
  },

  text: {
    ...FontSizes[15].medium,
    color: PortColors.primary.white,
  },
});
