import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
} from '@components/NumberlessText';
import {
  getEmojiSize,
  hasOnlyEmojis,
  renderProfileName,
  shouldRenderProfileName,
} from '@screens/Chat/BubbleUtils';
import {SavedMessageParams, TextParams} from '@utils/Messaging/interfaces';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';

// Returns a text bubble to be wrapped inside the ReplyBubble. Only contains the reply message inside it.
export default function TextReplyBubble({
  message,
  repliedText,
  handlePress,
  handleLongPress,
  memberName,
  isOriginalSender,
}: {
  message: SavedMessageParams;
  repliedText: string;
  handlePress: any;
  handleLongPress: any;
  memberName: string;
  isOriginalSender?: boolean;
}) {
  const replyText = (message.data as TextParams).text;
  const [showEmojiReplyBubble, setShowEmojiReplyBubble] =
    useState<boolean>(false);

  useEffect(() => {
    if (replyText.length <= 6) {
      setShowEmojiReplyBubble(hasOnlyEmojis(replyText));
    }
  }, [replyText]);

  const shouldExpandBubble = (
    showEmojiReplyBubble: boolean,
    replyText: string,
    repliedText: string,
  ): boolean => {
    if (showEmojiReplyBubble) {
      return replyText.length < repliedText.length;
    } else {
      return replyText.length - 8 < repliedText.length;
    }
  };

  return (
    <Pressable
      style={StyleSheet.compose(
        styles.textReplyContainer,
        //Controls the limit of when the bubble should expand to match the container inside
        shouldExpandBubble(showEmojiReplyBubble, replyText, repliedText) && {
          flex: 1,
        },
      )}
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
        true,
        isOriginalSender,
      )}
      {showEmojiReplyBubble ? (
        <NumberlessLinkText
          fontSizeType={getEmojiSize(replyText)}
          fontType={FontType.rg}
          numberOfLines={3}>
          {replyText || ''}
        </NumberlessLinkText>
      ) : (
        <NumberlessLinkText
          fontSizeType={FontSizeType.s}
          fontType={FontType.rg}
          numberOfLines={3}>
          {replyText || ''}
        </NumberlessLinkText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textReplyContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
});
