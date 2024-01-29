import FileIcon from '@assets/icons/FileClip.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';

export default function FileReplyContainer({
  message,
  memberName,
  URI,
}: {
  message: SavedMessageParams;
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
          backgroundColor: PortColors.primary.yellow.dull,
          width: 39,
          height: 39,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <FileIcon />
      </View>
      <View
        style={{
          marginLeft: 12,
          marginRight: 0.15 * screen.width,
        }}>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          textColor={PortColors.text.title}
          fontType={FontType.md}>
          {memberName}
        </NumberlessText>

        <NumberlessText fontSizeType={FontSizeType.s} fontType={FontType.rg}>
          {message.data.text ? message.data.text : 'File'}
        </NumberlessText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  replyImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
