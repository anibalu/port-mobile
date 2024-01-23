import React from 'react';
import {StyleSheet, View} from 'react-native';

const Notch = () => {
  return <View style={styles.topnotch} />;
};

export default Notch;
const styles = StyleSheet.create({
  topnotch: {
    alignSelf: 'center',
    width: 90,
    height: 6,
    borderRadius: 8,
    backgroundColor: '#D9D9D9',
    marginBottom: 20,
  },
});
