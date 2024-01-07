import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {
  renderProfileName,
  renderTimeStamp,
  shouldRenderProfileName,
} from '../BubbleUtils';

export default function TextBubble({
  message,
  handlePress,
  handleLongPress,
  memberName,
  isReply = false,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  memberName: string;
  isReply?: boolean;
}) {
  return (
    <Pressable
      style={StyleSheet.compose(
        styles.textBubbleContainer,
        isReply
          ? {alignItems: 'flex-start'}
          : {alignItems: 'flex-end', paddingHorizontal: 8},
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
        isReply,
      )}
      <NumberlessLinkText
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}
        numberOfLines={isReply ? 3 : 0}>
        {message.data.text || ''}
      </NumberlessLinkText>
      {!isReply && renderTimeStamp(message)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },
});
