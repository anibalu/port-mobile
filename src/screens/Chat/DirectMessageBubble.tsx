import React from 'react';
import {Dimensions, Pressable, StyleSheet, View} from 'react-native';
import {NumberlessRegularText} from '../../components/NumberlessText';
import {getTime} from '../../utils/Time';
import {directMessageContent} from '../../utils/DirectMessaging';

const SCREEN_WIDTH = Dimensions.get('window').width;

export function DirectMessageBubble(props: directMessageContent) {
  return (
    <View style={styles.container}>
      {props.sender ? (
        <View style={styles.SenderContainer}>
          <Pressable style={styles.blobSender}>
            <NumberlessRegularText style={styles.text}>
              {props.data.text}
            </NumberlessRegularText>
          </Pressable>
          <View style={styles.timeData}>
            <NumberlessRegularText style={styles.timeStamp}>
              {getTime(props.timestamp)}
            </NumberlessRegularText>
          </View>
        </View>
      ) : (
        <View style={styles.RecieverContainer}>
          <Pressable style={styles.blobReciever}>
            <NumberlessRegularText style={styles.text}>
              {props.data.text}
            </NumberlessRegularText>
          </Pressable>
          <View style={styles.timeData}>
            <NumberlessRegularText style={styles.timeStamp}>
              {getTime(props.timestamp)}
            </NumberlessRegularText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  SenderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
    paddingRight: 0,
    paddingBottom: 3,
    paddingTop: 2,
  },
  RecieverContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 0,
    paddingBottom: 3,
    paddingTop: 2,
  },
  blobSender: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20,
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
    maxWidth: 0.7 * SCREEN_WIDTH,
  },
  blobReciever: {
    backgroundColor: '#D4EBFF',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20,
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
    maxWidth: 0.7 * SCREEN_WIDTH,
  },
  timeData: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 80,
    paddingBottom: 3,
  },
  timeStamp: {
    fontSize: 10,
    color: '#B7B6B6',
  },
  text: {
    color: '#000000',
  },
});
