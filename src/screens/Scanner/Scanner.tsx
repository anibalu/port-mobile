import React from 'react';
import {SafeAreaView} from '../../components/SafeAreaView';
import {StyleSheet, StatusBar, View} from 'react-native';
import {BottomNavigator} from '../../components/BottomNavigator/BottomNavigator';
import {Page} from '../../components/BottomNavigator/Button';
import QRScanner from './QRscanner';
import {bundle, checkBundleData} from '../../utils/bundles';
import {bundleReadHandshake} from '../../actions/BundleReadHandshake';

function Scanner() {
  async function parseScannedCode(readString: string) {
    try {
      const bundle: bundle = checkBundleData(readString);
      await bundleReadHandshake(bundle);
      return true;
    } catch (error) {
      console.log('Qr is not of correct format: ', error);
      return false;
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
