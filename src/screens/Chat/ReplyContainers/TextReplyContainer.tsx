import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React from 'react';
import {View} from 'react-native';

export default function TextReplyContainer({
  message,
  memberName,
}: {
  message: SavedMessageParams;
  memberName: string;
}) {
  return (
    <>
      <NumberlessText fontSizeType={FontSizeType.l} fontType={FontType.sb}>
        {memberName}
      </NumberlessText>
      <View style={{marginTop: 3, marginRight: 20}}>
        <NumberlessLinkText
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          numberOfLines={3}
          ellipsizeMode="tail">
          {message.data.text}
        </NumberlessLinkText>
      </View>
    </>
  );
}
