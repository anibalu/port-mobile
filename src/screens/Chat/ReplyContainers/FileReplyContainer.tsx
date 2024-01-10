import FileIcon from '@assets/icons/FileClip.svg';
import {screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';

export default function FileReplyContainer({
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
        <NumberlessText
          style={{maxWidth: screen.width - 160}}
          fontSizeType={FontSizeType.l}
          fontType={FontType.sb}>
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
