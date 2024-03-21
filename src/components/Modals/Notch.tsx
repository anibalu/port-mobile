import {PortColors} from '@components/ComponentUtils';
import React from 'react';
import {StyleSheet, View} from 'react-native';

const Notch = () => {
  return <View style={styles.topnotch} />;
};

export default Notch;
const styles = StyleSheet.create({
  topnotch: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 8,
    backgroundColor: PortColors.primary.notch,
    marginBottom: 20,
  },
});
