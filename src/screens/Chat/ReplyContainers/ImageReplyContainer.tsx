import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import Gallery from '@assets/icons/GalleryIcon.svg';

export default function ImageReplyContainer({
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
          overflow: 'hidden',
        }}>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.md}
          ellipsizeMode="tail"
          textColor={PortColors.text.title}
          numberOfLines={1}>
          {memberName}
        </NumberlessText>
        <View
          style={{flexDirection: 'row', marginTop: 2, alignItems: 'center'}}>
          <Gallery style={{marginRight: 2}} height={16} width={16} />
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            numberOfLines={3}
            ellipsizeMode="tail">
            {message.data.text ? message.data.text : 'Image'}
          </NumberlessText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  replyImageContainer: {
    flexDirection: 'row',
    width: '70%',
    alignItems: 'center',
  },
});
