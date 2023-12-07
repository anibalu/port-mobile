import React, {FC, ReactNode} from 'react';
import {
  StyleSheet,
  Pressable,
  View,
  TextStyle,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import {NumberlessMediumText} from './NumberlessText';
import {FontSizes, PortColors} from './ComponentUtils';
import {SvgProps} from 'react-native-svg';

/**
 * Generic button for Numberless, use this for any and all buttons in app.
 * @param onPress
 * @param buttonStyle, custom styling
 * @param textStyle , custom styling for text
 * @param iconPosition , has two options: left or right
 * @param iconStyle , styling the icon itself
 * @param iconSize , sets the height and width of the icon
 * @param Icon, SVG Icon Component
 * @param loading, toggles a loader inside. Disables button presses while loading automatically.
 * @returns {ReactNode} a button component
 */
export function GenericButton({
  children,
  onPress,
  buttonStyle,
  textStyle,
  iconPosition = 'left',
  iconStyle,
  iconSize,
  Icon,
  loading,
}: {
  children?: React.ReactNode;
  onPress: any;
  iconPosition?: 'left' | 'right';
  iconStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  iconSize?: number;
  Icon?: FC<SvgProps>;
  loading?: boolean;
}): ReactNode {
  return (
    <Pressable
      style={StyleSheet.compose(styles.button, buttonStyle)}
      onPress={loading ? () => {} : onPress}>
      {loading ? (
        <ActivityIndicator size={'small'} color={PortColors.primary.white} />
      ) : (
        <>
          {Icon && iconPosition == 'left' ? (
            <View
              style={StyleSheet.compose(
                children ? {marginRight: 8} : {},
                iconStyle,
              )}>
              <Icon
                height={iconSize ? iconSize : 24}
                width={iconSize ? iconSize : 24}
              />
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
              <Icon
                height={iconSize ? iconSize : 24}
                width={iconSize ? iconSize : 24}
              />
            </View>
          ) : null}
        </>
      )}
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
