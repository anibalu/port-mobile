import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';

export default function VideoReplyContainer({
  // message,
  memberName,
  URI,
}: {
  // message: SavedMessageParams;
  memberName: string | null | undefined;
  URI: string;
}) {
  return (
    <Pressable
      style={styles.replyImageContainer}
      onPress={() => {
        FileViewer.open(URI, {
          showOpenWithDialog: true,
        });
      }}>
      <View
        style={{
          overflow: 'hidden',
          width: '100%',
        }}>
        <NumberlessText
          numberOfLines={1}
          ellipsizeMode="tail"
          fontSizeType={FontSizeType.l}
          fontType={FontType.sb}>
          {memberName}
        </NumberlessText>

        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          numberOfLines={3}
          style={{marginTop: 3, marginRight: 20}}
          ellipsizeMode="tail">
          Video
        </NumberlessText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
