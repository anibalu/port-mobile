import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {TextParams} from '@utils/Messaging/interfaces';
import {GroupReplyContent} from '@utils/Storage/DBCalls/groupMessage';

import {REPLY_MEDIA_HEIGHT, memberIdToHex} from '../BubbleUtils';

export const TextReplyBubble = ({
  reply,
  memberName,
}: {
  reply: GroupReplyContent;
  memberName: string;
}): ReactNode => {
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
          {(reply.data as TextParams).text}
        </NumberlessText>
      </View>
    </View>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      minHeight: REPLY_MEDIA_HEIGHT,
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
    },
  });
