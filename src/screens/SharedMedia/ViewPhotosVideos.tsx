import Play from '@assets/icons/videoPlay.svg';
import {PortColors, isIOS, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {MediaActionsBar} from '@screens/SharedMedia/MediaActionsBar';
import {MediaEntry} from '@utils/Media/interfaces';
import {ContentType} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {getImagesAndVideos} from '@utils/Storage/media';
import React, {useCallback, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {TabStackParamList} from './SharedMedia';

type Props = MaterialTopTabScreenProps<TabStackParamList, 'ViewPhotosVideos'>;

const ViewPhotosVideos = ({route}: Props) => {
  const [media, setMedia] = useState<MediaEntry[]>([]);

  const {chatId} = route.params;
  //stores list of media IDs
  const [selectedMedia, setSelectedMedia] = useState<MediaEntry[]>([]);

  const loadMedia = async () => {
    const response = await getImagesAndVideos(chatId);
    setMedia(response);
  };

  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      (() => {
        loadMedia();
        setSelectedMedia([]);
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const toggleImageSelection = (path: MediaEntry) => {
    if (selectedMedia.includes(path)) {
      setSelectedMedia(prevSelected =>
        prevSelected.filter(selectedPath => selectedPath !== path),
      );
    } else {
      setSelectedMedia(prevSelected => [...prevSelected, path]);
    }
  };

  const rows = [];
  for (let i = 0; i < media.length; i += 3) {
    const rowImages = media.slice(i, i + 3);
    rows.push(
      <View key={i} style={styles.row}>
        {rowImages.map(mediaItem => (
          <Pressable
            key={mediaItem.mediaId}
            onPress={() => {
              if (selectedMedia.length === 0) {
                FileViewer.open(getSafeAbsoluteURI(mediaItem.filePath, 'doc'), {
                  showOpenWithDialog: true,
                });
              } else {
                toggleImageSelection(mediaItem);
              }
            }}
            onLongPress={() => {
              toggleImageSelection(mediaItem);
            }}>
            <Image
              source={{
                uri:
                  mediaItem.type === ContentType.video &&
                  mediaItem.previewPath !== undefined
                    ? getSafeAbsoluteURI(mediaItem.previewPath, 'cache')
                    : getSafeAbsoluteURI(mediaItem.filePath, 'doc'),
              }}
              style={
                selectedMedia.includes(mediaItem)
                  ? StyleSheet.compose(styles.image, styles.selectedImage)
                  : styles.image
              }
            />
            {mediaItem.type === ContentType.video && (
              <Play
                style={{
                  position: 'absolute',
                  top: 0.25 * screen.width - 70,
                  left: 0.25 * screen.width - 70,
                }}
              />
            )}

            {selectedMedia.includes(mediaItem) && (
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}
                textColor={PortColors.text.primaryWhite}
                style={styles.countBadge}>
                {selectedMedia.indexOf(mediaItem) + 1}
              </NumberlessText>
            )}
          </Pressable>
        ))}
      </View>,
    );
  }

  const onForward = () => {
    navigation.navigate('ForwardToContact', {
      chatId: chatId,
      messages: selectedMedia.map(item => item.messageId),
      setSelectedMessages: setSelectedMedia,
      mediaOnly: true,
    });
  };

  const updateAfterDeletion = (messageId: string[]): void => {
    setMedia(media =>
      media.filter(media => !messageId.includes(media.messageId)),
    );
    setSelectedMedia([]);
  };

  return (
    <View style={styles.screen}>
      {media.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: 'center',
            paddingBottom: selectedMedia.length > 0 ? 100 : 20,
            paddingTop: 10,
          }}
          style={styles.container}>
          {rows}
        </ScrollView>
      ) : (
        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}
          style={styles.nocontentText}>
          No Media yet
        </NumberlessText>
      )}
      {selectedMedia.length > 0 && (
        <View style={styles.messagebar}>
          <MediaActionsBar
            chatId={chatId}
            onForward={onForward}
            selectedMedia={selectedMedia}
            setSelectedMedia={setSelectedMedia}
            postDelete={updateAfterDeletion}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  nocontentText: {
    paddingLeft: 30,
    paddingVertical: 15,
  },
  image: {
    width: (screen.width - 70) / 3,
    height: (screen.width - 70) / 3,
    borderRadius: 8,
  },
  selectedImage: {
    borderWidth: 3,
    borderColor: '#547CEF',
  },
  container: {
    flexDirection: 'column',
    paddingHorizontal: 21,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    columnGap: 13,
    marginBottom: 13,
  },
  countBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: PortColors.primary.blue.app,
    borderRadius: isIOS ? 9 : 20,
    height: 20,
    width: 20,
    paddingTop: isIOS ? 2 : 0,
    paddingHorizontal: isIOS ? 4 : 0,
  },
  countText: {
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  messagebar: {
    position: 'absolute',
    bottom: 0,
  },
  screen: {
    height: '100%',
  },
});

export default ViewPhotosVideos;
