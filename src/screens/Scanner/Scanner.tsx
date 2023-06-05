import React from 'react';
import {SafeAreaView} from '../../components/SafeAreaView';
import {StyleSheet, StatusBar, View, Alert} from 'react-native';
import {BottomNavigator} from '../../components/BottomNavigator/BottomNavigator';
import {Page} from '../../components/BottomNavigator/Button';
import QRScanner from './QRscanner';
import {useNavigation} from '@react-navigation/native';

function Scanner() {
  const navigation = useNavigation();
  function parseScannedCode(event) {
    if (event.nativeEvent.codeStringValue) {
      try {
        const readString = event.nativeEvent.codeStringValue;
        const bundle = JSON.parse(readString);
        console.log(bundle);
        navigation.navigate('Home');
        //do stuff here
        //check whether QR code is a numberless QR code
      } catch (error) {
        Alert.alert('QR code not a numberless QR code');
        navigation.navigate('Home');
      }
    }
  }
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <QRScanner onCodeScanned={parseScannedCode} />
      <View style={styles.bottomBar}>
        <BottomNavigator active={Page.scanner} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
  },
  bottomBar: {
    position: 'absolute',
    width: '100%',
  },
});

export default Scanner;
