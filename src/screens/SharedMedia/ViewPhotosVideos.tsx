import React, {useEffect, useState} from 'react';

import {NumberlessRegularText} from '@components/NumberlessText';

import Play from '@assets/icons/videoPlay.svg';
import {screen} from '@components/ComponentUtils';
import {MediaEntry} from '@utils/Media/interfaces';
import {ContentType} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {getImagesAndVideos} from '@utils/Storage/media';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';

const ViewPhotosVideos = ({chatId}: {chatId: string}) => {
  const [media, setMedia] = useState<MediaEntry[]>([]);

  const loadMedia = async () => {
    const response = await getImagesAndVideos(chatId);
    console.log('Response is: ', response);
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
        {rowImages.map(media => (
          <Pressable
            key={media.mediaId}
            onPress={() => {
              FileViewer.open(getSafeAbsoluteURI(media.filePath, 'doc'), {
                showOpenWithDialog: true,
              });
            }}>
            <>
              <Image
                source={{
                  uri:
                    media.type === ContentType.video &&
                    media.previewPath != undefined
                      ? getSafeAbsoluteURI(media.previewPath, 'cache')
                      : getSafeAbsoluteURI(media.filePath, 'doc'),
                }}
                style={styles.image}
              />
              {media.type === ContentType.video && (
                <Play
                  style={{
                    position: 'absolute',
                    top: 0.25 * screen.width - 55,
                    left: 0.25 * screen.width - 55,
                  }}
                />
              )}
            </>
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
