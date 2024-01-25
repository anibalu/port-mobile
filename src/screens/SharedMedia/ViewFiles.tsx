import React, {useCallback, useState} from 'react';

import {NumberlessRegularText} from '@components/NumberlessText';
import {StyleSheet, View} from 'react-native';

import {MediaEntry} from '@utils/Media/interfaces';
import {ContentType} from '@utils/Messaging/interfaces';
import {getMedia} from '@utils/Storage/media';

import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {useFocusEffect} from '@react-navigation/native';
import {TabStackParamList} from '@screens/SharedMedia/SharedMedia';
import FileComponent from './FileComponent';

type Props = MaterialTopTabScreenProps<TabStackParamList, 'ViewFiles'>;

export default function ViewFiles({route}: Props) {
  const [media, setMedia] = useState<MediaEntry[]>([]);

  const loadMedia = async () => {
    const response = await getMedia(route.params.chatId, ContentType.file);
    setMedia(response);
  };

  useFocusEffect(
    useCallback(() => {
      (() => {
        loadMedia();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

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
