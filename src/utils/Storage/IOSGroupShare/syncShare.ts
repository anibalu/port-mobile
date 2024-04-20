import {APP_GROUP_IDENTIFIER} from '@configs/constants';
import RNFS from 'react-native-fs';
import {getConnections} from '../connections';
import {Platform} from 'react-native';

export async function syncShared() {
  if (Platform.OS !== 'ios') {
    return;
  }
  try {
    const basePath = await RNFS.pathForGroup(APP_GROUP_IDENTIFIER);
    console.log('[IOS SYNC] base path: ', basePath);
    const syncFilePath = basePath + '/syncFile.json';
    // if (!(await RNFS.exists(syncFilePath))) {
    //   await RNFS.writeFile(syncFilePath, '{}', 'utf8');
    // }
    const data = {};
    const connections = await getConnections();
    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];
      data[connection.chatId] = connection.name;
    }
    RNFS.writeFile(syncFilePath, JSON.stringify(data), 'utf8');
    console.log('WROTE!!!!!!');
  } catch (e) {
    console.error('[IOS SYNC]', e);
  }
}
