import React, {ReactNode} from 'react';

import {Pressable, StyleSheet} from 'react-native';

import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import {PortColors} from '@components/ComponentUtils';

/**
 * @param message, message object
 * @returns {ReactNode} info bubble element
 */
export default function InfoBubble(message: SavedMessageParams): ReactNode {
  return (
    <Pressable style={styles.textBubbleContainer}>
      <NumberlessText
        fontSizeType={FontSizeType.s}
        fontType={FontType.rg}
        textColor={PortColors.text.messageBubble.infoText}>
        {message.data.info.toString()}
      </NumberlessText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
