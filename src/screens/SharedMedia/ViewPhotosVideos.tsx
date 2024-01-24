import React, {useEffect, useState} from 'react';

import {NumberlessRegularText} from '@components/NumberlessText';

import Play from '@assets/icons/videoPlay.svg';
import {screen} from '@components/ComponentUtils';
import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {TabStackParamList} from '@screens/SharedMedia/SharedMedia';
import {fetchFilesInMediaDir} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {ReadDirItem} from 'react-native-fs';

type Props = MaterialTopTabScreenProps<TabStackParamList, 'ViewPhotosVideos'>;

const ViewPhotosVideos = ({route}: Props) => {
  const [media, setMedia] = useState<ReadDirItem[]>([]);

  const loadMedia = async () => {
    const response = await fetchFilesInMediaDir(route.params.chatId);
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
            {media?.path.includes('.mp4') ? (
              <View style={styles.blackimage}>
                <Play
                  style={{
                    position: 'absolute',
                    top: 0.25 * screen.width - 65,
                    left: 0.25 * screen.width - 60,
                  }}
                />
              </View>
            ) : (
              <Image
                source={{uri: 'file://' + media?.path}}
                style={styles.image}
              />
            )}
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
};

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
  blackimage: {
    width: (screen.width - 30) / 3,
    height: (screen.width - 30) / 3,
    margin: 5,
    borderRadius: 24,
    backgroundColor: 'black',
  },
});

export default ViewPhotosVideos;
