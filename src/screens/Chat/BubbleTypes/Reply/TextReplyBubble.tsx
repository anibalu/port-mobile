import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
} from '@components/NumberlessText';
import {
  renderProfileName,
  shouldRenderProfileName,
} from '@screens/Chat/BubbleUtils';
import {SavedMessageParams, TextParams} from '@utils/Messaging/interfaces';
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

// Returns a text bubble to be wrapped inside the ReplyBubble. Only contains the reply message inside it.
export default function TextReplyBubble({
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
  return (
    <Pressable
      style={StyleSheet.compose(
        styles.textReplyContainer,
        //Controls the limit of when the bubble should expand to match the container inside
        text.length < 24 && {flex: 1},
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

      <NumberlessLinkText
        fontSizeType={FontSizeType.s}
        fontType={FontType.rg}
        numberOfLines={3}>
        {text || ''}
      </NumberlessLinkText>
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
