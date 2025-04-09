import React from 'react';
import {StyleSheet, View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {GroupReplyContent} from '@utils/Storage/DBCalls/groupMessage';
import {formatDuration} from '@utils/Time';

import {
  MAX_WIDTH_REPLY,
  MIN_WIDTH_REPLY,
  REPLY_MEDIA_HEIGHT,
  REPLY_MEDIA_WIDTH,
  memberIdToHex,
} from '../BubbleUtils';

export default function AudioReplyBubble({
  reply,
  memberName,
}: {
  reply: GroupReplyContent;
  memberName: string;
}) {
  const durationTime = reply?.data?.duration || 0;
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const mainColor = memberIdToHex(
    reply.memberId,
    Colors.boldAccentColors,
    Colors.messagebubble.border,
  );

  return (
    <View style={styles.container}>
      <View style={{...styles.replyContainer, borderColor: mainColor}}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}
          textColor={mainColor}
          numberOfLines={1}>
          {memberName}
        </NumberlessText>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          textColor={Colors.text.primary}
          numberOfLines={3}>
          {'🔊 Voice note (' + formatDuration(durationTime) + ')'}
        </NumberlessText>
      </View>
    </View>
  );
}

const styling = Colors =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      minHeight: REPLY_MEDIA_HEIGHT,
      minWidth: MIN_WIDTH_REPLY,
      justifyContent: 'space-between',
      backgroundColor: Colors.primary.surface,
      borderRadius: 12,
      overflow: 'hidden',
    },
    replyContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingVertical: PortSpacing.tertiary.uniform,
      paddingHorizontal: PortSpacing.tertiary.left,
      borderLeftWidth: 4,
      borderColor: Colors.messagebubble.border,
      maxWidth: MAX_WIDTH_REPLY - REPLY_MEDIA_WIDTH,
    },
    imageContainer: {
      width: REPLY_MEDIA_WIDTH,
    },
    image: {
      height: REPLY_MEDIA_HEIGHT,
      width: REPLY_MEDIA_WIDTH, // Set the maximum width you desire
    },
  });
