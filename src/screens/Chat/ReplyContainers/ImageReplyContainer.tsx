import DefaultImage from '@assets/avatars/avatar.png';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';

export default function ImageReplyContainer({
  message,
  memberName,
}: {
  message: SavedMessageParams;
  memberName: string;
}) {
  const [imageUri, setImageURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  useEffect(() => {
    if (message.data.fileUri) {
      setImageURI('file://' + message.data.fileUri);
    }
  }, [message]);
  return (
    <Pressable
      style={styles.replyImageContainer}
      onPress={() => {
        FileViewer.open(imageUri, {
          showOpenWithDialog: true,
        });
      }}>
      <View>
        <NumberlessText fontSizeType={FontSizeType.l} fontType={FontType.sb}>
          {memberName}
        </NumberlessText>

        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          numberOfLines={3}
          style={{marginTop: 3, marginRight: 20}}
          ellipsizeMode="tail">
          Image
        </NumberlessText>
      </View>
      <Image source={{uri: imageUri}} style={styles.replyImage} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  replyImage: {
    height: 65,
    width: 65,
    right: 15,
    borderRadius: 16,
  },
  replyImageContainer: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',

    justifyContent: 'space-between',
  },
  imageText: {
    marginTop: 10,
  },
});
