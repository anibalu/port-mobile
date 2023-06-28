import React from 'react';
import {View, StyleSheet, Image, Pressable} from 'react-native';
import {getTimeStamp} from '../../utils/Time';
import {UpdateConnectionProps, toggleRead} from '../../utils/Connection';
import {
  NumberlessRegularText,
  NumberlessSemiBoldText,
  NumberlessMediumText,
} from '../NumberlessText';
import {useNavigation} from '@react-navigation/native';

type ChatTileProps = UpdateConnectionProps;

function ChatTile(props: ChatTileProps) {
  const navigation = useNavigation();
  const handleNavigate = () => {
    const lineId = props.id;
    toggleRead(lineId);
    navigation.navigate('DirectChat', {lineId});
  };
  let status: string;
  if (props.readStatus && props.readStatus in ['read', 'sent', 'seen', 'new']) {
    status = props.readStatus;
  } else {
    status = 'read';
  }
  if (props.newMessageCount) {
    status = 'new';
  }
  if (props.newMessageCount === undefined) {
    status = 'new';
  }
  console.log(status);
  return (
    <Pressable
      style={
        props.readStatus === 'new'
          ? StyleSheet.compose(styles.tile, styles.newMessage)
          : styles.tile
      }
      onPress={handleNavigate}>
      <View style={styles.text}>
        <NumberlessSemiBoldText
          style={styles.nickname}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {props.nickname}
        </NumberlessSemiBoldText>
        <NumberlessRegularText
          style={
            props.readStatus === 'new'
              ? styles.content
              : StyleSheet.compose(styles.content, styles.newMessageContent)
          }
          ellipsizeMode="tail"
          numberOfLines={1}>
          {props.text}
        </NumberlessRegularText>
      </View>
      <View style={styles.messageBox}>
        <Image
          style={styles.picture}
          source={require('../../../assets/avatars/avatar1.png')}
        />
        <View style={styles.metadata}>
          <NumberlessMediumText style={styles.timestamp}>
            {getTimeStamp(props.timeStamp)}
          </NumberlessMediumText>
          <NumberlessSemiBoldText style={styles[status]}>
            {displayNumber(props.newMessageCount)}
          </NumberlessSemiBoldText>
        </View>
      </View>
    </Pressable>
  );
}
function displayNumber(newMsgCount) {
  if (newMsgCount === undefined) {
    return 'New';
  } else {
    if (newMsgCount > 999) {
      return '999+';
    }
    return newMsgCount;
  }
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    marginTop: 7,
    // padding: 10,
    borderRadius: 14,
    shadowOpacity: 13,
    shadowOffset: {
      width: 14,
      height: 8,
    },
    backgroundColor: '#FFF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 15,
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },
  newMessage: {
    backgroundColor: '#FFF',
  },
  newMessageContent: {
    color: '#9E9E9E',
  },
  messageBox: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  picture: {
    width: 50,
    height: 50,
    borderRadius: 17,
  },
  text: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignContent: 'flex-start',
    position: 'absolute',
    paddingRight: 64,
    paddingLeft: 78,
    // backgroundColor: 'green'
  },
  nickname: {
    fontSize: 16,
    lineHeight: 16,
    paddingBottom: 3,
  },
  content: {
    fontSize: 14,
    color: '#000000',
  },
  metadata: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 68,
    paddingBottom: 3,
    paddingTop: 3,
  },
  timestamp: {
    fontSize: 12,
    color: '#B7B6B6',
    // paddingBottom: 7,
  },
  read: {
    width: 9,
    height: 9,
    fontSize: 0,
  },
  sent: {
    backgroundColor: '#B7B6B6',
    borderRadius: 9,
    width: 9,
    height: 9,
    fontSize: 0,
    paddingBottom: 8,
  },
  seen: {
    backgroundColor: '#88A9FF',
    borderRadius: 9,
    width: 9,
    height: 9,
    fontSize: 0,
  },
  new: {
    backgroundColor: '#EE786B',
    padding: 2,
    paddingLeft: 4,
    paddingRight: 4,
    minWidth: 17,
    borderRadius: 19,
    fontSize: 10,
    textAlign: 'center',
    color: '#FFF',
  },
});

export default ChatTile;
