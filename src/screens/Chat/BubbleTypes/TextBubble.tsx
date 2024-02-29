import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams, TextParams} from '@utils/Messaging/interfaces';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {
  TEXT_OVERFLOW_LIMIT,
  getEmojiSize,
  hasOnlyEmojis,
  renderProfileName,
  renderTimeStamp,
  shouldRenderProfileName,
} from '../BubbleUtils';

export default function TextBubble({
  message,
  handlePress,
  handleLongPress,
  memberName,
  isOriginalSender,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  memberName: string;
  isOriginalSender?: boolean;
}) {
  const text = (message.data as TextParams).text;

  const [showEmojiBubble, setShowEmojiBubble] = useState<boolean>(false);

  useEffect(() => {
    if (text.length <= 6) {
      setShowEmojiBubble(hasOnlyEmojis(text));
    }
  }, [text]);

  return (
    <Pressable
      style={styles.textBubbleColumnContainer}
      onPress={() => {
        handlePress(message.messageId);
      }}
      onLongPress={() => {
        handleLongPress(message.messageId);
      }}>
      {renderProfileName(
        shouldRenderProfileName(memberName),
        memberName,
        message.sender,
        false,
        isOriginalSender,
      )}
      <View style={getBubbleLayoutStyle(text || '')}>
        {showEmojiBubble ? (
          <NumberlessText
            fontSizeType={getEmojiSize(text)}
            fontType={FontType.rg}>
            {text || ''}
          </NumberlessText>
        ) : (
          <NumberlessLinkText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            {text || ''}
          </NumberlessLinkText>
        )}
        {renderTimeStamp(message)}
      </View>
    </Pressable>
  );
}

const getBubbleLayoutStyle = (text: string) => {
  const showEmojiBubble = hasOnlyEmojis(text);
  if (showEmojiBubble) {
    return styles.textBubbleColumnContainer;
  } else if (text.length > TEXT_OVERFLOW_LIMIT) {
    return styles.textBubbleColumnContainer;
  } else {
    return styles.textBubbleRowContainer;
  }
};

const styles = StyleSheet.create({
  textBubbleColumnContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  textBubbleRowContainer: {
    flexDirection: 'row',
    columnGap: 4,
    justifyContent: 'center',
  },
});
