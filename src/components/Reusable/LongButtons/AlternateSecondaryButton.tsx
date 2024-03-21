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

import {PortColors, FontSizes, PortSpacing} from '@components/ComponentUtils';
import React, {FC} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {SvgProps} from 'react-native-svg';
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
  return (
    <TouchableOpacity
      disabled={isLoading}
      style={styles.button}
      activeOpacity={0.6}
      onPress={() => onClick()}>
      <Text style={styles.buttonText}>{buttonText}</Text>
      {!isLoading && Icon && (
        <Icon
          style={{marginRight: 5}}
          height={iconSize === 's' ? 20 : 24}
          width={iconSize === 's' ? 20 : 24}
        />
      )}
      {isLoading && <SmallLoader size={iconSize === 's' ? 20 : 24} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: 'transparent',
    width: '100%',
    borderColor: PortColors.stroke,
    borderWidth: 1,
    paddingHorizontal: PortSpacing.secondary.uniform,
  },
  buttonText: {
    ...FontSizes[14].regular,
    color: PortColors.text.primary,
  },
});

export default AlternateSecondaryButton;
