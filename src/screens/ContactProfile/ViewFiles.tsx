import React, {useEffect, useState} from 'react';

import ChatBackground from '@components/ChatBackground';
import {NumberlessRegularText} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {fetchFilesInFileDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {StyleSheet, View} from 'react-native';
import {ReadDirItem} from 'react-native-fs';

import GenericTopBar from '@components/GenericTopBar';
import FileComponent from './FileComponent';

type Props = NativeStackScreenProps<AppStackParamList, 'ViewFiles'>;

export default function ViewFiles({navigation, route}: Props) {
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
      <ChatBackground />
      <GenericTopBar
        title="Files"
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      <View style={styles.mainContainer}>
        {media.length > 0 ? (
          <FileComponent media={media} />
        ) : (
          <NumberlessRegularText style={styles.nocontentText}>
            No Files yet
          </NumberlessRegularText>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    height: '100%',
    width: '100%',
    paddingVertical: 10,
  },
  nocontentText: {
    paddingLeft: 15,
  },
});
