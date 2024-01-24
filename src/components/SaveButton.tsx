/**
 * Styled save button
 */
import React from 'react';
import {StyleSheet} from 'react-native';
import {GenericButton} from './GenericButton';

export const SaveButton = ({
  onPress,
  style,
  ...rest
}: {
  onPress: () => void;
  style?: any;
}) => {
  return (
    <GenericButton
      buttonStyle={StyleSheet.compose(styles.save, style)}
      onPress={onPress}
      {...rest}>
      Save
    </GenericButton>
  );
};

const styles = StyleSheet.create({
  save: {
    flex: 1,
    fontSize: 15,
    borderRadius: 16,
    height: 60,
    padding: 0,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
  },
});
