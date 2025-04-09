import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';

import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
  NumberlessText,
} from '@components/NumberlessText';

import {TextParams} from '@utils/Messaging/interfaces';
import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';

import {useTheme} from 'src/context/ThemeContext';

import {
  RenderTimeStamp,
  TIME_STAMP_TEXT_PADDING_RECEIVER,
  TIME_STAMP_TEXT_PADDING_SENDER,
  getEmojiSize,
  hasOnlyEmojis,
} from '../BubbleUtils';

export const TextBubble = ({message}: {message: LoadedMessage}): ReactNode => {
  const paddingText = message.sender
    ? TIME_STAMP_TEXT_PADDING_SENDER
    : TIME_STAMP_TEXT_PADDING_RECEIVER;
  const initialText = (message.data as TextParams).text || '';
  const text = initialText + paddingText;

  const Colors = DynamicColors();
  const {themeValue} = useTheme();
  const edited = message.data?.messageIdToEdit ? true : false;
  const styles = styling(edited);

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
          textColor={Colors.text.primary}
          fontSizeType={FontSizeType.l}
          linkColor={
            themeValue === 'dark' ? Colors.primary.white : Colors.primary.accent
          }
          fontType={FontType.rg}>
          {text}
        </NumberlessLinkText>
      )}
      <View
        style={{
          position: 'absolute',
          right: 4,
          bottom: 5,
          flexDirection: 'row',
        }}>
        <RenderTimeStamp edited={edited} message={message} />
      </View>
    </View>
  );
};

const styling = (edited: boolean) =>
  StyleSheet.create({
    textContainerRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingHorizontal: 4,
      paddingVertical: 4,
      paddingRight: edited ? 24 : 4,
    },
  });
