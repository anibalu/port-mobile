/**
 * Styled save button
 */
import React from 'react';
import {StyleProp, StyleSheet, TextStyle, ViewStyle} from 'react-native';
import {GenericButton} from './GenericButton';

export const SaveButton = ({
  onPress,
  style,
  textStyle,
  loading,
  disabled,
  ...rest
}: {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  loading?: boolean;
  disabled?: boolean;
}) => {
  console.log('Rendering this');
  return (
    <GenericButton
      buttonStyle={StyleSheet.compose(styles.save, style)}
      onPress={onPress}
      textStyle={textStyle}
      loading={loading}
      disabled={disabled}
      {...rest}>
      Save
    </GenericButton>
  );
};

const styles = StyleSheet.create({
  save: {
    flex: 1,
    borderRadius: 16,
    height: 60,
    padding: 0,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
