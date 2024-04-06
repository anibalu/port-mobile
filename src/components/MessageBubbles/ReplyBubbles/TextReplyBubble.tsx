import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams, TextParams} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {REPLY_MEDIA_HEIGHT} from '../BubbleUtils';

export const TextReplyBubble = ({
  reply,
  memberName,
}: {
  reply: SavedMessageParams;
  memberName: string;
}): ReactNode => {
  return (
    <View style={styles.container}>
      <View style={styles.replyContainer}>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.md}
          textColor={PortColors.text.primary}
          numberOfLines={1}>
          {memberName}
        </NumberlessText>
        <NumberlessText
          fontSizeType={FontSizeType.xs}
          fontType={FontType.rg}
          textColor={PortColors.text.primary}
          numberOfLines={3}>
          {(reply.data as TextParams).text}
        </NumberlessText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    borderColor: PortColors.primary.blue.app,
  },
});
