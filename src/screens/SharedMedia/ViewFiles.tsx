import React, {useEffect, useState} from 'react';

import {NumberlessRegularText} from '@components/NumberlessText';
import {StyleSheet, View} from 'react-native';

import {MediaEntry} from '@utils/Media/interfaces';
import {ContentType} from '@utils/Messaging/interfaces';
import {getMedia} from '@utils/Storage/media';
import FileComponent from './FileComponent';

export default function ViewFiles({chatId}: {chatId: string}) {
  const [media, setMedia] = useState<MediaEntry[]>([]);

  const loadMedia = async () => {
    const response = await getMedia(chatId, ContentType.file);
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
