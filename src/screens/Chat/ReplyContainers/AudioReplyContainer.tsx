import {default as AudioThin} from '@assets/icons/Audiothin.svg';
import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import {formatDuration} from '@utils/Time';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

export default function AudioReplyContainer({
  message,
  memberName,
}: {
  message: SavedMessageParams;
  memberName: string | null | undefined;
}) {
  const durationTime = message?.data?.duration;
  return (
    <Pressable style={styles.replyImageContainer}>
      <View>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          textColor={PortColors.text.title}
          fontType={FontType.md}>
          {memberName}
        </NumberlessText>
        <View
          style={{flexDirection: 'row', marginTop: 4, alignItems: 'center'}}>
          <AudioThin height={22} width={22} />

          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            numberOfLines={3}
            style={{marginLeft: 2, marginTop: -2, marginRight: 85}}>
            Voice notes ({formatDuration(durationTime)})
          </NumberlessText>
        </View>
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
