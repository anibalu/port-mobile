import React, {useEffect, useState} from 'react';

import {NumberlessRegularText} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {fetchFilesInMediaDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {Dimensions, Image, Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {ReadDirItem} from 'react-native-fs';

import ChatBackground from '@components/ChatBackground';
import GenericTopBar from '@components/GenericTopBar';

type Props = NativeStackScreenProps<AppStackParamList, 'ViewPhotosVideos'>;

export default function ViewPhotosVideos({navigation, route}: Props) {
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
      <ChatBackground />
      <GenericTopBar
        title="Photos & Videos"
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      <View style={styles.mainContainer}>
        {media.length > 0 ? (
          <View style={styles.container}>{rows}</View>
        ) : (
          <NumberlessRegularText style={styles.nocontentText}>
            No Media yet
          </NumberlessRegularText>
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
  mainContainer: {
    height: '100%',
    width: '100%',
    paddingVertical: 10,
  },
  nocontentText: {
    paddingLeft: 15,
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
