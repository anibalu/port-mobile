import React from 'react';
import {SafeAreaView} from '../../components/SafeAreaView';
import {StyleSheet, StatusBar, View} from 'react-native';
import {BottomNavigator} from '../../components/BottomNavigator/BottomNavigator';
import {Page} from '../../components/BottomNavigator/Button';
import QRScanner from './QRscanner';
import {useNavigation} from '@react-navigation/native';
import { createLine } from '../../utils/line';
import { bundle, checkBundleData, saveReadBundle } from '../../utils/bundles';
import { ConnectionType, addConnection } from '../../utils/Connection';
import { readProfileNickname } from '../../utils/Profile';
import { sendMessage } from '../../utils/messaging';

function Scanner() {
  const navigation = useNavigation();
  async function parseScannedCode(readString:string) {
    try {
      const bundle: bundle = checkBundleData(readString);
      //create line and do the handshake
      //if that fails, save read bundle.
      try {
        const response = await createLine(bundle.bundles.data.linkId);
        if (response) {
          const now: Date = new Date();
          await addConnection({
            connectionType: ConnectionType.line,
            id: response.newLine,
            nickname: "",
            readStatus: "new",
            timeStamp: now.toISOString(),
          })
          const name = await readProfileNickname();
          console.log('sending nickname after scanning');
          await sendMessage({nickname: name}, response.newLine);
        } else {
          throw new Error("network error in creating line");
        }
      } catch (error) {
        console.log('error in immediate line creation. saving link and doing it later');
        await saveReadBundle(bundle);
      }
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
