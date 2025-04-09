import React, {useCallback, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';


import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import FileViewer from 'react-native-file-viewer';


import {MediaActionsBar} from '@components/ActionBars/MediaActionsBar';
import {screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {TabStackParamList} from '@screens/SharedMedia/SharedMedia';

import {ContentType} from '@utils/Messaging/interfaces';
import {MediaEntry} from '@utils/Storage/DBCalls/media';
import {getMediaForChat} from '@utils/Storage/media';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

import Icon from '@assets/icons/NoFilesFound.svg';

import FileTile from './FileTile';

type Props = MaterialTopTabScreenProps<TabStackParamList, 'ViewFiles'>;

export default function ViewFiles({route}: Props) {
  const [media, setMedia] = useState<MediaEntry[]>([]);

  const {chatId} = route.params;
  //stores list of media IDs
  const [selectedMedia, setSelectedMedia] = useState<MediaEntry[]>([]);
  const navigation = useNavigation<any>();

  const loadMedia = async () => {
    const response = await getMediaForChat(
      route.params.chatId,
      ContentType.file,
    );
    setMedia(response);
  };

  const onForward = () => {
    navigation.navigate('ForwardToContact', {
      chatId: chatId,
      messages: selectedMedia.map(item => item.messageId),
    });
  };
  const toggleFileSelection = (path: MediaEntry) => {
    console.log(path);
    // if (selectedMedia.includes(path)) {
    //   setSelectedMedia(prevSelected =>
    //     prevSelected.filter(selectedPath => selectedPath !== path),
    //   );
    // } else {
    //   setSelectedMedia(prevSelected => [...prevSelected, path]);
    // }
  };

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const renderItem = ({item}: {item: MediaEntry}) => (
    <View style={styles.row}>
      <Pressable
        style={
          selectedMedia.includes(item)
            ? StyleSheet.compose(styles.file, styles.selectedFile)
            : styles.file
        }
        key={item.mediaId}
        onPress={() => {
          if (selectedMedia.length === 0) {
            FileViewer.open(getSafeAbsoluteURI(item.filePath, 'doc'), {
              showOpenWithDialog: true,
            });
          } else {
            toggleFileSelection(item);
          }
        }}
        onLongPress={() => {
          toggleFileSelection(item);
        }}>
        <FileTile mediaItem={item} selectedMedia={selectedMedia} />
      </Pressable>
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      (() => {
        loadMedia();
        setSelectedMedia([]);
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <View style={styles.screen}>
      {media.length > 0 ? (
        <FlatList
          data={media}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          horizontal={false}
          keyExtractor={(item: any) => item.mediaId.toString()}
          renderItem={renderItem}
          contentContainerStyle={StyleSheet.compose(styles.container, {
            paddingBottom: selectedMedia.length > 0 ? 100 : 20,
          })}
        />
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
            No files found
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
          />
        </View>
      )}
    </View>
  );
}

const styling = (color: any) =>
  StyleSheet.create({
    screen: {
      backgroundColor: color.primary.background,
      height: '100%',
    },
    messagebar: {
      position: 'absolute',
      bottom: 0,
    },
    container: {
      flexDirection: 'column',
      paddingHorizontal: 21,
      width: '100%',
      alignItems: 'center',
      paddingTop: 10,
    },
    file: {
      height: (screen.width - 70) / 4,
      borderRadius: 16,
      flexDirection: 'row',
      gap: 10,
      width: '100%',
      backgroundColor: color.primary.surface,
      padding: 10,
    },
    selectedFile: {
      paddingRight: 2,
      paddingLeft: 12,
      paddingVertical: 7,
      borderWidth: 3,
      borderColor: '#547CEF',
    },
    row: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      width: '100%',
      rowGap: 13,
      marginBottom: 13,
    },
  });
