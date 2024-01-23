import React, {ReactNode} from 'react';

import {Pressable, StyleSheet} from 'react-native';

import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';

/**
 * @param message, message object
 * @returns {ReactNode} data bubble element
 */
export default function DataBubble(message: SavedMessageParams): ReactNode {
  return (
    <Pressable style={styles.textBubbleContainer}>
      {message.contentType === ContentType.name ? (
        <NumberlessText fontSizeType={FontSizeType.s} fontType={FontType.rg}>
          {(message.data?.name?.toString() || DEFAULT_NAME) +
            ' has joined the chat'}
        </NumberlessText>
      ) : (
        // <NumberlessRegularText style={styles.text}>

        // </NumberlessRegularText>
        <>
          <NumberlessText fontSizeType={FontSizeType.s} fontType={FontType.rg}>
            {'data message: ' + message.contentType.toString()}
          </NumberlessText>
          <NumberlessText fontSizeType={FontSizeType.s} fontType={FontType.rg}>
            {JSON.stringify(message.data)}
          </NumberlessText>
        </>
      )}
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
