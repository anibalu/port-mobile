import React, {ReactNode} from 'react';

import {Pressable, StyleSheet} from 'react-native';

import {NumberlessRegularText} from '@components/NumberlessText';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {PortColors} from '@components/ComponentUtils';
import {DEFAULT_NAME} from '@configs/constants';

/**
 * @param message, message object
 * @returns {ReactNode} data bubble element
 */
export default function DataBubble(message: SavedMessageParams): ReactNode {
  return (
    <Pressable style={styles.textBubbleContainer}>
      {message.contentType === ContentType.name ? (
        <NumberlessRegularText style={styles.text}>
          {(message.data?.name?.toString() || DEFAULT_NAME) +
            ' has joined the chat'}
        </NumberlessRegularText>
      ) : (
        <>
          <NumberlessRegularText style={styles.text}>
            {'data message: ' + message.contentType.toString()}
          </NumberlessRegularText>
          <NumberlessRegularText style={styles.text}>
            {JSON.stringify(message.data)}
          </NumberlessRegularText>
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
    marginTop: 2,
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
    color: '#000000',
    fontSize: 12,
  },
});
