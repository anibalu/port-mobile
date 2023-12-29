import React, {useEffect, useState} from 'react';

import {NumberlessRegularText} from '@components/NumberlessText';

import {screen} from '@components/ComponentUtils';
import {fetchFilesInMediaDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {ReadDirItem} from 'react-native-fs';

export default function ViewPhotosVideos({chatId}: {chatId: string}) {
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
    <View>
      {media.length > 0 ? (
        <View style={styles.container}>{rows}</View>
      ) : (
        <NumberlessRegularText style={styles.nocontentText}>
          No Media yet
        </NumberlessRegularText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nocontentText: {
    paddingLeft: 15,
  },
  image: {
    width: (screen.width - 30) / 3,
    height: (screen.width - 30) / 3,
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
