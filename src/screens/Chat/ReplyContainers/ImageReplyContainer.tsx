import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';

export default function ImageReplyContainer({
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
          fontSizeType={FontSizeType.m}
          fontType={FontType.sb}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {memberName}
        </NumberlessText>

        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          numberOfLines={3}
          style={{marginTop: 3, overflow: 'hidden'}}
          ellipsizeMode="tail">
          Image
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
    padding: 5,
  },
  imageText: {
    marginTop: 10,
  },
});
