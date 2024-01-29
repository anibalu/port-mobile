import {
  FontSizeType,
  FontType,
  NumberlessLinkText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
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
  isOriginalSender,
}: {
  message: SavedMessageParams;
  handlePress: any;
  handleLongPress: any;
  memberName: string;
  isReply?: boolean;
  isOriginalSender?: boolean;
}) {
  return (
    <Pressable
      style={StyleSheet.compose(
        styles.textBubbleColumnContainer,
        isReply
          ? {alignItems: 'flex-start', maxWidth: '95%'}
          : {alignItems: 'flex-end'},
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
        isOriginalSender,
      )}
      <View style={getBubbleLayoutStyle(message.data.text || '')}>
        <NumberlessLinkText
          fontSizeType={isReply ? FontSizeType.s : FontSizeType.m}
          fontType={FontType.rg}
          numberOfLines={isReply ? 3 : 0}>
          {message.data.text || ''}
        </NumberlessLinkText>
        {!isReply && renderTimeStamp(message)}
      </View>
    </Pressable>
  );
}

const getBubbleLayoutStyle = (text: string) => {
  if (text.length > 27) {
    return styles.textBubbleColumnContainer;
  } else {
    return styles.textBubbleRowContainer;
  }
};

const styles = StyleSheet.create({
  textBubbleColumnContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  textBubbleRowContainer: {
    flexDirection: 'row',
    columnGap: 4,
    justifyContent: 'center',
  },
});
