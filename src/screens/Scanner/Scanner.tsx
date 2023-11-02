/**
 * Scanner screen to scan Numberless QR codes
 * screen Id: 6
 */
import React from 'react';
import {SafeAreaView} from '../../components/SafeAreaView';
import {StyleSheet, StatusBar, View} from 'react-native';
import {BottomNavigator} from '../../components/BottomNavigator/BottomNavigator';
import {Page} from '../../components/BottomNavigator/Button';
import QRScanner from './QRscanner';

function Scanner() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <QRScanner />
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
