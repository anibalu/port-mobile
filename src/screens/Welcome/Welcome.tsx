/*
 * The welcome screen that greets users when they first download the app
 */

import React from 'react';
import {View, StyleSheet, TouchableOpacity, StatusBar} from 'react-native';
import {NumberlessBoldText} from '../../components/NumberlessText';
import {getFCMToken, registerBackgroundMessaging} from '../../utils/messaging';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from '../../components/SafeAreaView';
import Logo from '../../../assets/miscellaneous/appLogo.svg';
import Name from '../../../assets/miscellaneous/appName.svg';

function Welcome() {
  // Get navigation props
  const navigation = useNavigation();
  // For development
  getFCMToken();
  // Setup the capability to handle messages in the background
  registerBackgroundMessaging();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#547CEF" />
      <View style={styles.greeting}>
        <Logo width={95} height={95} style={styles.logo} />
        <Name width={226} height={84} style={styles.name} />
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
