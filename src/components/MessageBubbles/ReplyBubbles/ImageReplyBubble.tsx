import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {LargeDataParams, SavedMessageParams} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  MAX_WIDTH_REPLY,
  MIN_WIDTH_REPLY,
  REPLY_MEDIA_HEIGHT,
  REPLY_MEDIA_WIDTH,
} from '../BubbleUtils';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';

export const ImageReplyBubble = ({
  reply,
  memberName,
}: {
  reply: SavedMessageParams;
  memberName: string;
}): ReactNode => {
  const text =
    (reply.data as LargeDataParams).text &&
    (reply.data as LargeDataParams).text !== ''
      ? (reply.data as LargeDataParams).text
      : 'Image';
  const fileUri = (reply.data as LargeDataParams).fileUri;
  return (
    <View style={styles.container}>
      <View style={styles.replyContainer}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}
          textColor={PortColors.text.primary}
          numberOfLines={1}>
          {memberName}
        </NumberlessText>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          textColor={PortColors.text.primary}
          numberOfLines={3}>
          {'📷 ' + text}
        </NumberlessText>
      </View>
      {fileUri && (
        <View style={styles.imageContainer}>
          <Image
            source={{uri: getSafeAbsoluteURI(fileUri, 'doc')}}
            style={styles.image}
          />
        </View>
      )}
    </View>
  );
};

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
    flex: 1,
    width: REPLY_MEDIA_WIDTH, // Set the maximum width you desire
  },
});
