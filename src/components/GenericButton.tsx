import React, {FC, ReactNode} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {SvgProps} from 'react-native-svg';
import {PortColors} from './ComponentUtils';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';

/**
 * Generic button for Numberless, use this for any and all buttons in app.
 * @deprecated
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
  iconSize,
  iconSizeRight,
  IconLeft,
  iconStyleLeft,
  IconRight,
  iconStyleRight,
  loading,
  disabled = false,
  onLongPress,
  onPressOut,
}: {
  children?: React.ReactNode;
  onPress: any;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  iconSize?: number;
  IconLeft?: FC<SvgProps>;
  iconStyleLeft?: ViewStyle;
  IconRight?: FC<SvgProps>;
  iconStyleRight?: ViewStyle;
  iconSizeRight?: number;
  loading?: boolean;
  disabled?: boolean;
  onLongPress?: any;
  onPressOut?: any;
}): ReactNode {
  return (
    <Pressable
      style={StyleSheet.compose(styles.button, buttonStyle)}
      disabled={disabled || loading}
      onPressOut={onPressOut}
      onLongPress={onLongPress}
      onPress={loading ? () => {} : onPress}>
      {loading ? (
        <ActivityIndicator
          size={'small'}
          color={PortColors.primary.white}
          style={{marginTop: 5}}
        />
      ) : (
        <>
          {IconLeft ? (
            <View
              style={StyleSheet.compose(
                children ? {marginRight: 8} : {},
                iconStyleLeft,
              )}>
              <IconLeft
                height={iconSize ? iconSize : 24}
                width={iconSize ? iconSize : 24}
              />
            </View>
          ) : null}
          {children ? (
            <NumberlessText
              fontType={FontType.md}
              fontSizeType={FontSizeType.m}
              style={StyleSheet.compose(styles.text, textStyle)}>
              {children}
            </NumberlessText>
          ) : null}
          {IconRight ? (
            <View
              style={StyleSheet.compose(
                children ? {marginLeft: 8} : {},
                iconStyleRight,
              )}>
              <IconRight
                height={
                  iconSizeRight ? iconSizeRight : iconSize ? iconSize : 24
                }
                width={iconSizeRight ? iconSizeRight : iconSize ? iconSize : 24}
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
    flexDirection: 'row',
    backgroundColor: PortColors.primary.blue.app,
    borderRadius: 16,
    padding: 15,
  },
  text: {
    color: PortColors.primary.white,
  },
});
