import React, {useEffect, useState} from 'react';

import {View, StyleSheet} from 'react-native';

import {NumberlessRegularText} from '../../../components/NumberlessText';
import {getTime} from '../../../utils/Time';
import Sending from '../../../../assets/icons/sending.svg';
import {directMessageContent} from '../../../utils/MessageInterface';
import {DirectMessaging} from '../../../utils/DirectMessaging';

/**
 * Renders text message container to be inserted into chat bubbles.
 * @param props TextContent object containing text and timestamp to render.
 * @returns Rendered text content
 */
export default function TextBubble(props: {
  message: directMessageContent;
  lineId: string;
}) {
  const [isSent, setIsSent] = useState<boolean>(false);
  useEffect(() => {
    if (!props.message.inFile) {
      const messaging = new DirectMessaging(props.lineId);
      messaging.sendMessage(props.message).then(x => setIsSent(x));
    } else {
      setIsSent(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={styles.textBubbleContainer}>
      <NumberlessRegularText style={styles.text}>
        {props.message.data.text}
      </NumberlessRegularText>
      <View style={styles.timeStampContainer}>
        {isSent ? (
          <View>
            <NumberlessRegularText style={styles.timeStamp}>
              {getTime(props.message.data.timestamp)}
            </NumberlessRegularText>
          </View>
        ) : (
          <View>
            <Sending />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textBubbleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  timeStampContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  timeStamp: {
    fontSize: 10,
    color: '#B7B6B6',
  },
  text: {
    color: '#000000',
  },
});
