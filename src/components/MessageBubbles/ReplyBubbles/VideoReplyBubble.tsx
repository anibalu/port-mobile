import React, {ReactNode, useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {LargeDataParams} from '@utils/Messaging/interfaces';
import {ReplyContent} from '@utils/Storage/DBCalls/lineMessage';
import {getMedia} from '@utils/Storage/media';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

import {
  MAX_WIDTH_REPLY,
  MIN_WIDTH_REPLY,
  REPLY_MEDIA_HEIGHT,
  REPLY_MEDIA_WIDTH,
} from '../BubbleUtils';

export const VideoReplyBubble = ({
  reply,
  memberName,
}: {
  reply: ReplyContent;
  memberName: string;
}): ReactNode => {
  const text =
    (reply.data as LargeDataParams).text &&
    (reply.data as LargeDataParams).text !== ''
      ? (reply.data as LargeDataParams).text
      : 'Video';
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const [fileUri, setFileUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const mediaInfo = await getMedia((reply.data as LargeDataParams).mediaId);
      if (mediaInfo) {
        const image = mediaInfo.previewPath;
        setFileUri(image);
      } else {
        setFileUri((reply.data as LargeDataParams).previewUri);
      }
    })();
  }, [reply]);

  return (
    <View style={styles.container}>
      <View style={styles.replyContainer}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}
          textColor={Colors.text.memberName}
          numberOfLines={1}>
          {memberName}
        </NumberlessText>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          textColor={Colors.text.primary}
          numberOfLines={3}>
          {'🎥 ' + text}
        </NumberlessText>
      </View>
      <View style={styles.imageContainer}>
        {fileUri && (
          <Image
            source={{uri: getSafeAbsoluteURI(fileUri, 'cache')}}
            style={styles.image}
          />
        )}
      </View>
    </View>
  );
};

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
      backgroundColor: PortColors.primary.black,
    },
    image: {
      flex: 1,
      width: REPLY_MEDIA_WIDTH, // Set the maximum width you desire
    },
  });
