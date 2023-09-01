/*
 * The welcome screen that greets users when they first download the app
 */

import React from 'react';
import {View, StyleSheet, TouchableOpacity, StatusBar} from 'react-native';
import {NumberlessBoldText} from '../../components/NumberlessText';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from '../../components/SafeAreaView';
import Logo from '../../../assets/miscellaneous/portBranding.svg';

function Welcome() {
  // Get navigation props
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#547CEF" />
      <View style={styles.greeting}>
        <Logo height={175} style={styles.logo} />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('RequestPermissions')}>
        <NumberlessBoldText style={styles.buttonText}>
          Get started
        </NumberlessBoldText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#547CEF',
    height: '100%',
    width: '100%',
  },
  greeting: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    paddingBottom: 50,
  },
  logo: {
    marginBottom: '5%',
  },
  name: {
    marginBottom: '15%',
  },
  button: {
    marginBottom: '10%',
    backgroundColor: '#FFFFFF',
    width: '85%',
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#547CEF',
  },
});

export default Welcome;
