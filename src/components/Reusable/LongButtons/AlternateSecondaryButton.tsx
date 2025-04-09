/**
 * A Secondary button to use in Port that displays an Icon and Text.
 * The icon is always positioned to the right of the text.
 *
 * The button takes the following props:
 * 1. buttonText - string with a max size of 16
 * 2. buttonColor - "b" (default), "r" or "w"
 * 3. icon (optional) - svg icon to display
 * 4. iconSize (optional) - "s" (default), "m"
 * 5. onClick - function that runs on clicking.
 */

import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';

import {SvgProps} from 'react-native-svg';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import SmallLoader from '../Loaders/SmallLoader';

const AlternateSecondaryButton = ({
  isLoading,
  buttonText,
  Icon,
  iconSize,
  onClick,
}: {
  isLoading: boolean;
  buttonText: string;
  Icon?: FC<SvgProps>;
  iconSize?: 's' | 'm';
  onClick: () => void;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <TouchableOpacity
      disabled={isLoading}
      style={styles.button}
      activeOpacity={0.6}
      onPress={() => onClick()}>
      {!isLoading && Icon && (
        <Icon
          height={iconSize === 's' ? 20 : 24}
          width={iconSize === 's' ? 20 : 24}
        />
      )}
      {isLoading && <SmallLoader size={iconSize === 's' ? 20 : 24} />}

      <NumberlessText
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}
        textColor={Colors.primary.accent}
        style={{
          textAlign: 'center',
        }}>
        {buttonText}
      </NumberlessText>
    </TouchableOpacity>
  );
};

const styling = (_color: any) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: 'transparent',
      gap: PortSpacing.medium.right,
      paddingVertical: 12,
    },
  });

export default AlternateSecondaryButton;
