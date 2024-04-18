import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams, TextParams} from '@utils/Messaging/interfaces';
import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  hasOnlyEmojis,
  getEmojiSize,
  RenderTimeStamp,
  TIME_STAMP_TEXT_PADDING_SENDER,
  TIME_STAMP_TEXT_PADDING_RECEIVER,
} from '../BubbleUtils';

export const TextBubble = ({
  message,
}: {
  message: SavedMessageParams;
}): ReactNode => {
  const paddingText = message.sender
    ? TIME_STAMP_TEXT_PADDING_SENDER
    : TIME_STAMP_TEXT_PADDING_RECEIVER;
  const initialText = (message.data as TextParams).text || '';
  const text = initialText + paddingText;

  return (
    <View
      style={
        hasOnlyEmojis(initialText)
          ? {...styles.textContainerRow, flexDirection: 'column'}
          : styles.textContainerRow
      }>
      {hasOnlyEmojis(initialText) ? (
        <View>
          <NumberlessText
            fontSizeType={getEmojiSize(initialText)}
            fontType={FontType.rg}
            style={{alignSelf: 'center'}}>
            {initialText}
          </NumberlessText>
          <NumberlessText fontSizeType={FontSizeType.m} fontType={FontType.rg}>
            {paddingText}
          </NumberlessText>
        </View>
      ) : (
        <NumberlessLinkText
          fontSizeType={FontSizeType.l}
          fontType={FontType.rg}>
          {text}
        </NumberlessLinkText>
      )}
      <View style={{position: 'absolute', right: 4, bottom: 4}}>
        <RenderTimeStamp message={message} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
