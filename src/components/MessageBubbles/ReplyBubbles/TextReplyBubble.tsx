import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams, TextParams} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {PortSpacing} from '@components/ComponentUtils';
import {REPLY_MEDIA_HEIGHT} from '../BubbleUtils';
import DynamicColors from '@components/DynamicColors';

export const TextReplyBubble = ({
  reply,
  memberName,
}: {
  reply: SavedMessageParams;
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
          textColor={Colors.primary.accent}
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

const styling = Colors =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      minHeight: REPLY_MEDIA_HEIGHT,
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
