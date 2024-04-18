import VideoIcon from '@assets/icons/Videoicon.svg';
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

export default function VideoReplyContainer({
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
          numberOfLines={1}
          ellipsizeMode="tail"
          textColor={PortColors.text.title}
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}>
          {memberName}
        </NumberlessText>
        <View style={{flexDirection: 'row', marginTop: 2}}>
          <VideoIcon style={{marginRight: 4}} />

          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            numberOfLines={3}
            ellipsizeMode="tail">
            {message.data.text ? message.data.text : 'Video'}
          </NumberlessText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  replyImageContainer: {
    width: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageText: {
    marginTop: 10,
  },
});
