import React, {useEffect, useState} from 'react';

import {
  View,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import {SafeAreaView} from '../../components/SafeAreaView';
import Topbar from '../MediaView/Topbar';
import {useRoute} from '@react-navigation/native';
import {fetchFilesInMediaDir} from '../../utils/Storage/StorageRNFS/sharedFileHandlers';
import {NumberlessRegularText} from '../../components/NumberlessText';
import FileViewer from 'react-native-file-viewer';
import {ReadDirItem} from 'react-native-fs';

export default function ViewPhotosVideos() {
  const route = useRoute();
  const {chatId} = route.params;
  const [media, setMedia] = useState<ReadDirItem[]>([]);

  const loadMedia = async () => {
    const response = await fetchFilesInMediaDir(chatId);
    setMedia(response);
  };

  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = [];
  for (let i = 0; i < media.length; i += 3) {
    const rowImages = media.slice(i, i + 3);
    rows.push(
      <View key={i} style={styles.row}>
        {rowImages.map((media, index) => (
          <Pressable
            key={media?.path || index.toString()}
            onPress={() => {
              FileViewer.open('file://' + media?.path, {
                showOpenWithDialog: true,
              });
            }}>
            <Image
              source={{uri: 'file://' + media?.path}}
              style={styles.image}
            />
          </Pressable>
        ))}
      </View>,
    );
  }

  return (
    <SafeAreaView>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      />
      <Topbar title="Photos & Videos" />
      <View style={styles.mainContainer}>
        {media.length > 0 ? (
          <View style={styles.container}>{rows}</View>
        ) : (
          <NumberlessRegularText>No Media yet</NumberlessRegularText>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#FFF',
    opacity: 0.5,
    overflow: 'hidden',
  },
  mainContainer: {
    height: '100%',
    width: '100%',
    paddingVertical: 10,
  },
  image: {
    width: (Dimensions.get('window').width - 30) / 3,
    height: (Dimensions.get('window').width - 30) / 3,
    margin: 5,
    borderRadius: 8,
  },
  container: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
});
