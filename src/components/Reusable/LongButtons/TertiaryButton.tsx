/**
 * A Tertiary button to use in Port that displays an Icon and Text.
 * The button is always clickable.
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
import {TouchableOpacity, Text, StyleSheet, TextStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';

const TertiaryButton = ({
  buttonText,
  tertiaryButtonColor,
  Icon,
  iconSize,
  disabled,
  onClick,
}: {
  buttonText: string;
  tertiaryButtonColor: 'b' | 'r' | 'w';
  Icon?: FC<SvgProps>;
  iconSize?: 's' | 'm';
  disabled: boolean;
  onClick: () => void;
}) => {
  function tertiaryButtonTextColorPicker(
    tertiaryButtonColor?: string,
  ): TextStyle {
    if (tertiaryButtonColor === 'r') {
      return styles.redButtonText;
    } else if (tertiaryButtonColor === 'w') {
      return styles.whiteButtonText;
    } else {
      return styles.blueButtonText;
    }
  }

  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <TouchableOpacity
      disabled={disabled}
      style={StyleSheet.compose(
        {
          backgroundColor: 'transparent',
        },
        disabled ? styles.disabledButton : styles.button,
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
          tertiaryButtonTextColorPicker(tertiaryButtonColor),
          styles.buttonText,
        )}
        numberOfLines={1}
        ellipsizeMode={'tail'}>
        {buttonText.substring(0, 20)}
      </Text>
    </TouchableOpacity>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    disabledButton: {
      alignItems: 'center',
      height: 50,
      flexDirection: 'row',
      justifyContent: 'center',
      borderRadius: 12,
      opacity: 0.6,
    },
    button: {
      alignItems: 'center',
      height: 50,
      flexDirection: 'row',
      justifyContent: 'center',
      borderRadius: 12,
    },
    buttonText: {
      ...FontSizes[16].medium,
    },
    redButtonText: {
      color: color.primary.red,
    },
    whiteButtonText: {color: color.primary.white},
    blueButtonText: {color: color.button.accent},
  });

export default TertiaryButton;
