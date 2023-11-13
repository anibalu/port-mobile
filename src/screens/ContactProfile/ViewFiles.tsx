import React, {useEffect, useState} from 'react';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ImageBackground, StatusBar, StyleSheet, View} from 'react-native';
import {ReadDirItem} from 'react-native-fs';
import {NumberlessRegularText} from '../../components/NumberlessText';
import {SafeAreaView} from '../../components/SafeAreaView';
import {AppStackParamList} from '../../navigation/AppStackTypes';
import {fetchFilesInFileDir} from '../../utils/Storage/StorageRNFS/sharedFileHandlers';
import Topbar from '../MediaView/Topbar';
import FileComponent from './FileComponent';

type Props = NativeStackScreenProps<AppStackParamList, 'ViewFiles'>;

export default function ViewFiles({route}: Props) {
  const {chatId} = route.params;
  const [media, setMedia] = useState<ReadDirItem[]>([]);

  const loadMedia = async () => {
    const response = await fetchFilesInFileDir(chatId);
    setMedia(response);
  };

  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      />
      <Topbar title="Files" />
      <View style={styles.mainContainer}>
        {media.length > 0 ? (
          <FileComponent media={media} />
        ) : (
          <NumberlessRegularText>No Files yet</NumberlessRegularText>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
