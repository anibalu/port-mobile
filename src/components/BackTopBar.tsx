import React from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import {BackButton} from './BackButton';
import {useNavigation} from '@react-navigation/native';

function BackTopbar() {
  const navigation = useNavigation();
  return (
    <View style={styles.bar}>
      <BackButton onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingRight: '6%',
    paddingLeft: '6%',
    backgroundColor: '#FFF',
    height: 51,
  },
});

export default BackTopbar;
