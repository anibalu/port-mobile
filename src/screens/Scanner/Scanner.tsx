/**
 * Scanner screen to scan Numberless QR codes
 * screen Id: 6
 */
import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from '@components/SafeAreaView';

import QRScanner from './QRscanner';

function Scanner() {
  return (
    <SafeAreaView style={styles.screen}>
      <QRScanner />
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
