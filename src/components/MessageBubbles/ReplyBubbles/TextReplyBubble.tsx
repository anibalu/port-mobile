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
import {ReplyContent} from '@utils/Storage/DBCalls/lineMessage';

import {REPLY_MEDIA_HEIGHT} from '../BubbleUtils';

export const TextReplyBubble = ({
  reply,
  memberName,
}: {
  reply: ReplyContent;
  memberName: string;
}): ReactNode => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <View style={styles.container}>
      <View style={styles.replyContainer}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}
          textColor={Colors.messagebubble.memberName}
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
