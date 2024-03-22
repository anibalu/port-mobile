import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {LargeDataParams, SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  MAX_WIDTH_REPLY,
  MIN_WIDTH_REPLY,
  REPLY_MEDIA_HEIGHT,
  REPLY_MEDIA_WIDTH,
} from '../BubbleUtils';

/**
 * @param message, message object
 * @param handlePress
 * @param handleLongPress
 * @param memberName
 * @param isReply, defaults to false, used to handle reply bubbles
 * @returns {ReactNode} file bubble component
 */
export default function FileReplyBubble({
  reply,
  memberName,
}: {
  reply: SavedMessageParams;
  memberName: string;
}): ReactNode {
  const displayName =
    (reply.data as LargeDataParams).text &&
    (reply.data as LargeDataParams).text !== ''
      ? (reply.data as LargeDataParams).text
      : (reply.data as LargeDataParams).fileName || 'File';
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
          {'📎 ' + displayName}
        </NumberlessText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: REPLY_MEDIA_HEIGHT,
    minWidth: MIN_WIDTH_REPLY,
    justifyContent: 'space-between',
  },
  replyContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingVertical: PortSpacing.tertiary.uniform,
    paddingHorizontal: PortSpacing.tertiary.left,
    borderLeftWidth: 4,
    borderColor: PortColors.primary.blue.app,
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
