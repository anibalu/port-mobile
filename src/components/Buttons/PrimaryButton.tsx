import React, {FC} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

import {SvgProps} from 'react-native-svg';

import {Colors, useThemeColors} from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {Size, Spacing} from '@components/spacingGuide';

interface PrimaryButtonProps {
  text: string;
  color?: string;
  theme: 'light' | 'dark';
  activityIndicatorColor?: string;
  Icon?: FC<SvgProps>;
  iconSize?: number;
  textStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}

/**
 * A Primary button component that displays text and an optional icon.
 * The button can be in one of three states:
 * 1. Normal/Clickable
 * 2. Disabled
 * 3. Loading (shows activity indicator)
 *
 * @param text - The text to display in the button
 * @param color - Background color of the button
 * @param activityIndicatorColor - Color of the loading spinner (defaults to white)
 * @param Icon - Optional SVG icon component to display before the text
 * @param iconSize - Size in pixels for both width and height of the icon
 * @param textStyle - Optional custom text styles to override defaults
 * @param buttonStyle - Optional custom button styles to override defaults
 * @param isLoading - If true, shows loading spinner instead of content
 * @param disabled - If true, button becomes non-clickable with disabled styling
 * @param onClick - Function called when button is pressed
 */

const PrimaryButton = ({
  text,
  color,
  theme,
  activityIndicatorColor = Colors.common.white,
  Icon,
  iconSize = Size.m,
  textStyle,
  buttonStyle,
  isLoading,
  disabled,
  onClick = () => {},
}: PrimaryButtonProps) => {
  const colors = useThemeColors(theme);
  const buttonColor =
    color || (theme === 'light' ? colors.black : colors.purple);

  return (
    <TouchableOpacity
      disabled={isLoading ? true : disabled}
      style={StyleSheet.compose(
        disabled ? styles.disabledButton : styles.button,
        {
          backgroundColor: buttonColor,
          ...buttonStyle,
        },
      )}
      activeOpacity={0.6}
      onPress={onClick}>
      {isLoading ? (
        <ActivityIndicator color={buttonColor === Colors.common.white ? Colors.common.black : activityIndicatorColor} />
      ) : (
        <>
          {Icon && (
            <Icon
              style={{marginRight: Spacing.xs}}
              height={iconSize}
              width={iconSize}
            />
          )}
          <NumberlessText
            style={StyleSheet.compose(
              buttonColor === Colors.common.white
                ? {
                    ...styles.buttonText,
                    color: Colors.common.black,
                  }
                : styles.buttonText,
              textStyle,
            )}
            numberOfLines={1}
            ellipsizeMode={'tail'}>
            {text}
          </NumberlessText>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabledButton: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 12,
    height: 50,
    opacity: 0.5,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 12,
    height: 50,
  },
  buttonText: {
    fontSize: FontSizeType.l,
    fontWeight: FontWeight.sb,
    color: Colors.common.white,
  },
});

export default PrimaryButton;
