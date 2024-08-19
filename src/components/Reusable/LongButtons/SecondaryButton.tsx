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

import {FontSizes} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
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
  buttonHeight = 50,
}: {
  isLoading?: boolean;
  buttonText: string;
  secondaryButtonColor: 'b' | 'r' | 'w' | 'black' | 'grey' | 'green';
  Icon?: FC<SvgProps>;
  iconSize?: 's' | 'm';
  onClick: () => void;
  buttonHeight?: number;
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
    } else if (secondaryButtonColor === 'grey') {
      return styles.greyButton;
    } else if (secondaryButtonColor === 'green') {
      return styles.greenButton;
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
    } else if (secondaryButtonColor === 'grey') {
      return styles.greyButtonText;
    } else if (secondaryButtonColor === 'green') {
      return styles.greenButtonText;
    } else {
      return styles.blueButtonText;
    }
  }

  const Colors = DynamicColors();
  const styles = styling(Colors, buttonHeight);
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
        <ActivityIndicator color={Colors.primary.accent} />
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

const styling = (color: any, buttonHeight: number) =>
  StyleSheet.create({
    redButton: {
      borderColor: color.primary.red,
      borderWidth: 1,
    },
    whiteButton: {borderColor: color.primary.white, borderWidth: 1},
    blackButton: {
      borderColor: color.primary.mainelements,
      borderWidth: 1,
    },
    blueButton: {
      borderColor: color.button.accent,
      borderWidth: 1,
    },
    greenButton: {
      borderColor: color.primary.green,
      borderWidth: 1,
    },
    greyButton: {borderColor: color.primary.darkgrey, borderWidth: 1},

    redButtonText: {
      color: color.primary.red,
    },
    greenButtonText: {
      color: color.primary.green,
    },
    whiteButtonText: {color: color.primary.white},
    blackButtonText: {color: color.primary.black},
    blueButtonText: {color: color.button.accent},
    greyButtonText: {color: color.primary.darkgrey},
    button: {
      alignItems: 'center',
      height: buttonHeight ? buttonHeight : 50,
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
