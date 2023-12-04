/**
 * Styled back button
 */
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import Back from '@assets/navigation/backButton.svg';

export const BackButton: React.FC<TouchableOpacityProps> = ({
  onPress,
  style,
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={StyleSheet.compose(styles.backIcon, style)}
      onPress={onPress}
      {...rest}>
      <Back width={16} height={16} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backIcon: {
    paddingTop: 16,
    alignItems: 'flex-start',
    width: 50,
    height: 51,
  },
});
