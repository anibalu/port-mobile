import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import React from 'react';
import {View, Image} from 'react-native';

export default function LinkReplyContainer({
  message,
  memberName,
}: {
  message: SavedMessageParams;
  memberName: string | null | undefined;
}) {
  const ogImage = message?.data?.fileUri || null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'stretch',
      }}>
      <View style={{flex: 1}}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}
          numberOfLines={1}
          style={{
            maxWidth: screen.width - 160,
          }}
          textColor={PortColors.text.title}
          ellipsizeMode="tail">
          {memberName}
        </NumberlessText>
        <View style={{marginTop: 3, marginRight: ogImage ? 80 : 20}}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            numberOfLines={3}
            ellipsizeMode="tail">
            {message.data.text}
          </NumberlessText>
        </View>
      </View>
      {ogImage && (
        <Image
          resizeMode="cover"
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 72,
            bottom: -10,
            alignSelf: 'stretch',
          }}
          source={{
            uri: getSafeAbsoluteURI(ogImage, 'doc'),
          }}
        />
      )}
    </View>
  );
}
