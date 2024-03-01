/**
 * A Secondary button to use in Port that displays an Icon and Text.
 * The icon is always positioned to the left of the text.
 *
 * The button takes the following props:
 * 1. buttonText - string with a max size of 16
 * 2. buttonColor - "b" (default), "r" or "w"
 * 3. icon (optional) - svg icon to display
 * 4. iconSize (optional) - "s" (default), "m"
 * 5. onClick - function that runs on clicking.
 */

import {PortColors, FontSizes} from '@components/ComponentUtils';
import React, {FC} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {SvgProps} from 'react-native-svg';

const SecondaryButton = ({
  buttonText,
  secondaryButtonColor,
  Icon,
  iconSize,
  onClick,
}: {
  buttonText: string;
  secondaryButtonColor: 'b' | 'r' | 'w';
  Icon?: FC<SvgProps>;
  iconSize?: 's' | 'm';
  onClick: () => void;
}) => {
  function secondaryButtonBorderColorPicker(
    secondaryButtonColor?: string,
  ): ViewStyle {
    if (secondaryButtonColor === 'r') {
      return styles.redButton;
    } else if (secondaryButtonColor === 'w') {
      return styles.whiteButton;
    } else {
      return styles.blueButton;
    }
  }
  function secondaryButtonTextColorPicker(
    secondaryButtonColor?: string,
  ): TextStyle {
    if (secondaryButtonColor === 'r') {
      return styles.redButtonText;
    } else if (secondaryButtonColor === 'w') {
      return styles.whiteButtonText;
    } else {
      return styles.blueButtonText;
    }
  }
  return (
    <TouchableOpacity
      style={StyleSheet.compose(
        secondaryButtonBorderColorPicker(secondaryButtonColor),
        styles.button,
      )}
      activeOpacity={0.6}
      onPress={() => onClick()}>
      {Icon && (
        <Icon
          style={{marginRight: 5}}
          height={iconSize === 'm' ? 24 : 20}
          width={iconSize === 'm' ? 24 : 20}
        />
      )}
      <Text
        style={StyleSheet.compose(
          secondaryButtonTextColorPicker(secondaryButtonColor),
          styles.buttonText,
        )}>
        {buttonText.length > 16
          ? buttonText.substring(0, 16) + '...'
          : buttonText}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  redButton: {
    borderColor: PortColors.primary.red.error,
    borderWidth: 1,
  },
  whiteButton: {borderColor: PortColors.primary.white, borderWidth: 1},
  blueButton: {borderColor: PortColors.primary.blue.app, borderWidth: 1},
  redButtonText: {
    color: PortColors.primary.red.error,
  },
  whiteButtonText: {color: PortColors.primary.white},
  blueButtonText: {color: PortColors.primary.blue.app},
  button: {
    alignItems: 'center',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  buttonText: {
    ...FontSizes[16].medium,
  },
});

export default SecondaryButton;
