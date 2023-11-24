import React from 'react';
import {
  NumberlessBoldText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';

export default function TextReplyContainer({
  message,
  memberName,
}: {
  message: SavedMessageParams;
  memberName: string;
}) {
  return (
    <>
      <NumberlessBoldText style={{color: '#000'}}>
        {memberName}
      </NumberlessBoldText>
      <NumberlessRegularText numberOfLines={3}>
        {message.data.text}
      </NumberlessRegularText>
    </>
  );
}
