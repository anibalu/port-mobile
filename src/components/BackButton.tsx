import React from 'react';
import {TouchableOpacity} from 'react-native';
import Back from '../../assets/navigation/backButton.svg';

export const BackButton = props => {
  return (
    <TouchableOpacity style={props.style} onPress={props.onPress}>
      <Back width={16} height={16} />
    </TouchableOpacity>
  );
};
