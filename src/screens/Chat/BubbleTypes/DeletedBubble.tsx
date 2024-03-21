import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {renderTimeStamp} from '../BubbleUtils';
import {PortColors} from '@components/ComponentUtils';

export default function DeletedBubble({
  message,
}: {
  message: SavedMessageParams;
  memberName: string;
  isOriginalSender?: boolean;
}) {
  const text = 'This message has been deleted';
  return (
    <Pressable style={styles.textBubbleColumnContainer}>
      <View style={styles.textBubbleRowContainer}>
        <NumberlessText
          style={{color: PortColors.primary.body}}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          {text}
        </NumberlessText>
        {renderTimeStamp(message)}
      </View>
    </Pressable>
  );
}

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
