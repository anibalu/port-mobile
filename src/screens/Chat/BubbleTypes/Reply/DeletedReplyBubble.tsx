import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React from 'react';
import {StyleSheet, View} from 'react-native';

export default function DeletedReplyBubble() {
  return (
    <View style={styles.textBubbleContainer}>
      <NumberlessText
        fontSizeType={FontSizeType.s}
        fontType={FontType.rg}
        textColor={PortColors.text.secondary}>
        This message no longer exists
      </NumberlessText>
    </View>
  );
}

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 8,
    alignItems: 'flex-start',
  },
});
