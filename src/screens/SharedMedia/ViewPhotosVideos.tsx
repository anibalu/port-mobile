import React, {useCallback, useState} from 'react';
import {FlatList, Image, Pressable, StyleSheet, View} from 'react-native';

import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {useFocusEffect, useNavigation} from '@react-navigation/native';


import {MediaActionsBar} from '@components/ActionBars/MediaActionsBar';
import {isIOS, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {ContentType} from '@utils/Messaging/interfaces';
import {isGroupChat} from '@utils/Storage/connections';
import {MediaEntry} from '@utils/Storage/DBCalls/media';
import {getGroupMessage} from '@utils/Storage/groupMessages';
import {getImagesAndVideos} from '@utils/Storage/media';
import {getMessage} from '@utils/Storage/messages';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

import Icon from '@assets/icons/NoFilesFound.svg';
import Play from '@assets/icons/videoPlay.svg';

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
    console.log(path);
    // if (selectedMedia.includes(path)) {
    //   setSelectedMedia(prevSelected =>
    //     prevSelected.filter(selectedPath => selectedPath !== path),
    //   );
    // } else {
    //   setSelectedMedia(prevSelected => [...prevSelected, path]);
    // }
  };

  const onClickMedia = async mediaItem => {
    const isGroup = await isGroupChat(chatId);
    const media = isGroup
      ? await getGroupMessage(chatId, mediaItem.messageId)
      : await getMessage(chatId, mediaItem.messageId);
    if (media) {
      navigation.push('MediaViewer', {
        isGroup: isGroup,
        message: media,
      });
    }
  };

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const renderItem = ({item}) => {
    const mediaItem = item;
    return (
      <Pressable
        key={mediaItem.mediaId}
        onPress={async () => {
          if (selectedMedia.length === 0) {
            await onClickMedia(mediaItem);
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
            textColor={Colors.text.primary}
            style={styles.countBadge}>
            {selectedMedia.indexOf(mediaItem) + 1}
          </NumberlessText>
        )}
      </Pressable>
    );
  };
  const onForward = () => {
    navigation.navigate('ForwardToContact', {
      chatId: chatId,
      messages: selectedMedia.map(item => item.messageId),
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
        <>
          <View style={styles.container}>
            <FlatList
              data={media}
              keyExtractor={(item) => item.mediaId}
              initialNumToRender={21}
              maxToRenderPerBatch={25}
              windowSize={60}
              renderItem={renderItem}
              numColumns={3}
            />
          </View>
        </>
      ) : (
        <View
          style={{
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{translateX: 0}, {translateY: -50}],
          }}>
          <Icon />
          <NumberlessText
            style={{textAlign: 'center'}}
            fontSizeType={FontSizeType.xl}
            fontType={FontType.md}
            textColor={Colors.text.primary}>
            No media found
          </NumberlessText>
        </View>
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

const styling = (color: any) =>
  StyleSheet.create({
    image: {
      width: (screen.width - 70) / 3,
      height: (screen.width - 70) / 3,
      borderRadius: 8,
      marginHorizontal: 8,
      marginBottom: 10,
    },
    selectedImage: {
      borderWidth: 3,
      borderColor: '#547CEF',
    },
    container: {
      paddingTop: 10,
      flexDirection: 'row',
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
      backgroundColor: color.primary.background,
    },
  });

export default ViewPhotosVideos;
