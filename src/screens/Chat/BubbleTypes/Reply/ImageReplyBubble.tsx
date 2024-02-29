import {default as ImageIcon} from '@assets/icons/GalleryIcon.svg';
import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {
  renderProfileName,
  shouldRenderProfileName,
} from '@screens/Chat/BubbleUtils';
import {
  LargeDataParams,
  SavedMessageParams,
  TextParams,
} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';

// Returns a text bubble to be wrapped inside the ReplyBubble. Only contains the reply message inside it.
export default function ImageReplyBubble({
  message,
  memberName,
  isOriginalSender,
}: {
  message: SavedMessageParams;
  memberName: string;
  isOriginalSender?: boolean;
}) {
  const text = (message.data as TextParams).text;
  const URI = (message.data as LargeDataParams).fileUri;

  const isImageSmall = text.length < 16;

  return (
    <View style={styles.imageReplyContainer}>
      <View style={styles.textWrapper}>
        {renderProfileName(
          shouldRenderProfileName(memberName),
          memberName,
          message.sender,
          true,
          isOriginalSender,
        )}

        <View
          style={StyleSheet.compose(
            styles.contentWrapper,
            text != '' && !isImageSmall && {marginRight: 16},
          )}>
          <ImageIcon width={14} height={14} style={{marginRight: 2}} />

          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            numberOfLines={3}>
            {text || 'Image'}
          </NumberlessText>
        </View>
      </View>

      {URI != undefined && URI != null ? (
        <Image
          source={{
            uri: getSafeAbsoluteURI(URI, 'doc'),
          }}
          style={{
            maxHeight: isImageSmall ? 50 : 75, // Set the maximum height you desire
            maxWidth: isImageSmall ? 50 : 75, // Set the maximum width you desire
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            flex: 1,
          }}
        />
      ) : (
        <View
          style={{
            backgroundColor: PortColors.primary.black,
            maxHeight: isImageSmall ? 48 : 75, // Set the maximum height you desire
            maxWidth: isImageSmall ? 48 : 75, // Set the maximum width you desire
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            flex: 1,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageReplyContainer: {
    flexDirection: 'row',
    maxHeight: 75,
    minHeight: 45,
    flex: 1,
    width: '100%',
  },
  textWrapper: {
    flexDirection: 'column',
    paddingVertical: 8,
    paddingHorizontal: 8,
    flex: 1,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignSelf: 'baseline',
    marginTop: 2,
  },
});
