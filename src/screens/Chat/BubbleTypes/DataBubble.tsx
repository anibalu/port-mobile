import React from 'react';

import {View, StyleSheet, Pressable} from 'react-native';

import {NumberlessRegularText} from '@components/NumberlessText';
import {getTimeStamp} from '@utils/Time';
import {SavedMessageParams} from '@utils/Messaging/interfaces';
import {PortColors} from '@components/ComponentUtils';

export default function DataBubble(message: SavedMessageParams) {
  return (
    <Pressable style={styles.textBubbleContainer}>
      <NumberlessRegularText style={styles.text}>
        {'data message: ' + message.contentType.toString()}
      </NumberlessRegularText>
      <NumberlessRegularText style={styles.text}>
        {JSON.stringify(message.data)}
      </NumberlessRegularText>
      <View style={styles.timeStampContainer}>
        <View>
          <NumberlessRegularText style={styles.timeStamp}>
            {getTimeStamp(message.timestamp)}
          </NumberlessRegularText>
        </View>
      </View>
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
    color: '#000000',
  },
});
