import React, {useEffect, useState} from 'react';

import {NumberlessRegularText} from '@components/NumberlessText';
import {fetchFilesInFileDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {StyleSheet, View} from 'react-native';
import {ReadDirItem} from 'react-native-fs';

import FileComponent from './FileComponent';

export default function ViewFiles({chatId}: {chatId: string}) {
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
    <View>
      {media.length > 0 ? (
        <FileComponent media={media} />
      ) : (
        <NumberlessRegularText style={styles.nocontentText}>
          No Files yet
        </NumberlessRegularText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nocontentText: {
    paddingLeft: 15,
  },
});
