import DefaultImage from '@assets/avatars/avatar.png';
import FileIcon from '@assets/icons/FileClip.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';

export default function FileReplyContainer({
  message,
  memberName,
}: {
  message: SavedMessageParams;
  memberName: string;
}) {
  const [fileUri, setFileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  useEffect(() => {
    if (message.data.fileUri) {
      setFileURI('file://' + message.data.fileUri);
    }
  }, [message]);
  return (
    <Pressable
      style={styles.replyImageContainer}
      onPress={() => {
        FileViewer.open(fileUri, {
          showOpenWithDialog: true,
        });
      }}>
      <View
        style={{
          backgroundColor: '#FEB95A',
          width: 39,
          height: 39,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <FileIcon />
      </View>
      <View style={{marginLeft: 12}}>
        <NumberlessText fontSizeType={FontSizeType.l} fontType={FontType.sb}>
          {memberName}
        </NumberlessText>

        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          style={{marginTop: 3, marginRight: 20}}>
          File
        </NumberlessText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  replyImageContainer: {
    minWidth: '70%',
    marginRight: 20,
    height: 63,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileText: {
    marginTop: 10,
  },
});
