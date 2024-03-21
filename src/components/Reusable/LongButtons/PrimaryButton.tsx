/**
 * A Primary button to use in Port that displays an Icon and Text.
 * Possible states:
 * 1. Clickable
 * 2. Disabled (not clickable)
 * 3. Loading (not clickable)
 * The icon is always positioned to the left of the text.
 * The buttons stretches to fill the parent container
 *
 * The button takes the following props:
 * 1. buttonText - string with a max size of 16
 * 2. buttonColor - "b" (default), "r" or "w"
 * 3. icon (optional) - svg icon to display
 * 4. iconSize (optional) - "s" (default), "m"
 * 5. disabled - false by default. If button should be in disabled state, use true.
 * 6. isLoading - false by default. If button should be in loading state, use true.
 * 7. onClick - function that runs on clicking.
 */

import {PortColors, FontSizes} from '@components/ComponentUtils';
import React, {FC} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TextStyle,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import {SvgProps} from 'react-native-svg';

const PrimaryButton = ({
  buttonText,
  primaryButtonColor,
  Icon,
  iconSize,
  textStyle,
  isLoading,
  disabled,
  onClick = () => {},
}: {
  buttonText: string;
  primaryButtonColor: 'b' | 'r' | 'w';
  Icon?: FC<SvgProps>;
  iconSize?: 's' | 'm';
  textStyle?: TextStyle;
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}) => {
  function primaryButtonStylePicker(primaryButtonColor?: string): ViewStyle {
    if (primaryButtonColor === 'r') {
      return styles.redButton;
    } else if (primaryButtonColor === 'w') {
      return styles.whiteButton;
    } else {
      return styles.blueButton;
    }
  }
  return (
    <TouchableOpacity
      disabled={isLoading ? true : disabled}
      style={StyleSheet.compose(
        primaryButtonStylePicker(primaryButtonColor),
        disabled ? styles.disabledButton : styles.button,
      )}
      activeOpacity={0.6}
      onPress={onClick}>
      {isLoading ? (
        <ActivityIndicator color={'white'} />
      ) : (
        <>
          {Icon && (
            <Icon
              style={{marginRight: 5}}
              height={iconSize === 'm' ? 24 : 20}
              width={iconSize === 'm' ? 24 : 20}
            />
          )}
          <Text
            style={StyleSheet.compose(
              textStyle,
              primaryButtonColor === 'w'
                ? {...styles.buttonText, color: PortColors.text.primary}
                : styles.buttonText,
            )}
            numberOfLines={1}
            ellipsizeMode={'tail'}>
            {buttonText.substring(0, 20)}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabledButton: {
    width: '100%',
    alignItems: 'center',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 12,
    opacity: 0.6,
  },
  redButton: {
    backgroundColor: PortColors.primary.red.error,
  },
  whiteButton: {backgroundColor: PortColors.primary.white},
  blueButton: {backgroundColor: PortColors.primary.blue.app},
  button: {
    width: '100%',
    alignItems: 'center',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 12,
  },
  buttonText: {
    ...FontSizes[16].medium,
    color: PortColors.text.primaryWhite,
  },
});

export default PrimaryButton;
