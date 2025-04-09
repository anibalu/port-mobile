import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {LargeDataParams} from '@utils/Messaging/interfaces';
import {GroupReplyContent} from '@utils/Storage/DBCalls/groupMessage';

import {
  MAX_WIDTH_REPLY,
  MIN_WIDTH_REPLY,
  REPLY_MEDIA_HEIGHT,
  REPLY_MEDIA_WIDTH,
  memberIdToHex,
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
  reply: GroupReplyContent;
  memberName: string;
}): ReactNode {
  const displayName =
    (reply.data as LargeDataParams).text &&
    (reply.data as LargeDataParams).text !== ''
      ? (reply.data as LargeDataParams).text
      : (reply.data as LargeDataParams).fileName || 'File';
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
          {'📎 ' + displayName}
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
