import {PortColors, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
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
  memberName: string | null | undefined;
}) {
  return (
    <>
      <NumberlessText
        fontSizeType={FontSizeType.s}
        fontType={FontType.md}
        numberOfLines={1}
        style={{
          maxWidth: screen.width - 160,
        }}
        textColor={PortColors.text.title}
        ellipsizeMode="tail">
        {memberName}
      </NumberlessText>
      <View style={{marginTop: 3, marginRight: 20}}>
        <NumberlessText
          fontSizeType={FontSizeType.s}
          fontType={FontType.rg}
          numberOfLines={3}
          ellipsizeMode="tail">
          {message.data.text}
        </NumberlessText>
      </View>
    </>
  );
}
