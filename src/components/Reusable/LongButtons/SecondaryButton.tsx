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
  ActivityIndicator,
} from 'react-native';
import {SvgProps} from 'react-native-svg';

const SecondaryButton = ({
  buttonText,
  isLoading = false,
  secondaryButtonColor,
  Icon,
  iconSize,
  onClick,
}: {
  isLoading?: boolean;
  buttonText: string;
  secondaryButtonColor: 'b' | 'r' | 'w' | 'black';
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
    } else if (secondaryButtonColor === 'black') {
      return styles.blackButton;
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
    } else if (secondaryButtonColor === 'black') {
      return styles.blackButtonText;
    } else {
      return styles.blueButtonText;
    }
  }
  return (
    <TouchableOpacity
      disabled={isLoading}
      style={StyleSheet.compose(
        secondaryButtonBorderColorPicker(secondaryButtonColor),
        styles.button,
      )}
      activeOpacity={0.6}
      onPress={() => onClick()}>
      {isLoading ? (
        <ActivityIndicator color={PortColors.primary.blue.app} />
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
              secondaryButtonTextColorPicker(secondaryButtonColor),
              styles.buttonText,
            )}
            numberOfLines={1}
            ellipsizeMode={'tail'}>
            {buttonText.substring(0, 22)}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  redButton: {
    borderColor: PortColors.primary.red.error,
    borderWidth: 1,
  },
  whiteButton: {borderColor: PortColors.primary.white, borderWidth: 1},
  blackButton: {
    borderColor: PortColors.stroke,
    borderWidth: 1,
  },
  blueButton: {borderColor: PortColors.primary.blue.app, borderWidth: 1},
  redButtonText: {
    color: PortColors.primary.red.error,
  },
  whiteButtonText: {color: PortColors.primary.white},
  blackButtonText: {color: PortColors.primary.black},
  blueButtonText: {color: PortColors.primary.blue.app},
  button: {
    alignItems: 'center',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'transparent',
    width: '100%',
  },
  buttonText: {
    ...FontSizes[16].medium,
  },
});

export default SecondaryButton;
