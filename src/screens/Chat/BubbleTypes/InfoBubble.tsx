import React, {ReactNode} from 'react';

import {StyleSheet, Pressable} from 'react-native';

import {NumberlessRegularText} from '@components/NumberlessText';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import {PortColors} from '@components/ComponentUtils';

/**
 * @param message, message object
 * @returns {ReactNode} info bubble element
 */
export default function InfoBubble(message: SavedMessageParams): ReactNode {
  return (
    <Pressable style={styles.textBubbleContainer}>
      <NumberlessRegularText style={styles.text}>
        {message.data.info.toString()}
      </NumberlessRegularText>
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
  timeStampContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeStamp: {
    fontSize: 10,
    color: PortColors.primary.grey.dark,
  },
  text: {
    textAlign: 'center',
    color: '#000000',
    fontSize: 12,
  },
});
