import React from 'react';
import {View, StyleSheet, Image, Pressable} from 'react-native';
import {getTimeStamp} from '@utils/Time';
import {
  NumberlessRegularText,
  NumberlessSemiBoldText,
  NumberlessMediumText,
} from '../NumberlessText';
import {useNavigation} from '@react-navigation/native';
import DefaultImage from '@assets/avatars/avatar.png';
import {
  ConnectionInfo,
  ConnectionType,
  ReadStatus,
} from '@utils/Connections/interfaces';

function ChatTile(props: ConnectionInfo) {
  const navigation = useNavigation();
  //sets profile picture URI
  function chooseProfileURI() {
    if (props.pathToDisplayPic && props.pathToDisplayPic !== '') {
      return `file://${props.pathToDisplayPic}`;
    }
    return Image.resolveAssetSource(DefaultImage).uri;
  }

  //handles navigation to a chat screen and toggles chat to read.
  const handleNavigate = async () => {
    navigation.navigate('DirectChat', {chatId: props.chatId});
  };
  let status: string = props.readStatus;

  return props.authenticated ||
    props.connectionType === ConnectionType.group ? (
    <Pressable
      style={
        props.readStatus === ReadStatus.new
          ? StyleSheet.compose(styles.tile, styles.newMessage)
          : styles.tile
      }
      onPress={handleNavigate}>
      <View style={styles.text}>
        <NumberlessSemiBoldText
          style={styles.nickname}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {props.name}
        </NumberlessSemiBoldText>
        <NumberlessRegularText
          style={
            props.readStatus === ReadStatus.new
              ? styles.content
              : StyleSheet.compose(styles.content, styles.newMessageContent)
          }
          ellipsizeMode="tail"
          numberOfLines={1}>
          {props.text}
        </NumberlessRegularText>
      </View>
      <View style={styles.messageBox}>
        <Image source={{uri: chooseProfileURI()}} style={styles.picture} />
        <View style={styles.metadata}>
          <NumberlessMediumText style={styles.timestamp}>
            {getTimeStamp(props.timestamp)}
          </NumberlessMediumText>
          <View style={styles[status]}>
            <NumberlessSemiBoldText style={styles[status]}>
              {displayNumber(props.newMessageCount, status)}
            </NumberlessSemiBoldText>
          </View>
        </View>
      </View>
    </Pressable>
  ) : (
    <Pressable
      style={
        props.readStatus === ReadStatus.new
          ? StyleSheet.compose(styles.tile, styles.newMessage)
          : styles.tile
      }
      onPress={handleNavigate}>
      <View style={styles.text}>
        <NumberlessSemiBoldText
          style={styles.nickname}
          ellipsizeMode="tail"
          numberOfLines={1}>
          New contact
        </NumberlessSemiBoldText>
        <NumberlessRegularText
          style={
            props.readStatus === ReadStatus.new
              ? styles.content
              : StyleSheet.compose(styles.content, styles.newMessageContent)
          }
          ellipsizeMode="tail"
          numberOfLines={1}>
          Initializing a new contact
        </NumberlessRegularText>
      </View>
      <View style={styles.messageBox}>
        <Image
          source={{uri: Image.resolveAssetSource(DefaultImage).uri}}
          style={styles.pictureInit}
        />
      </View>
    </Pressable>
  );
}

//returns display string based on new message count
function displayNumber(newMsgCount: undefined | number, status: string) {
  switch (status) {
    case 'sent':
      return '';
    default:
      if (newMsgCount === undefined || newMsgCount === 0) {
        return 'New';
      } else {
        if (newMsgCount > 999) {
          return '999+';
        }
        return newMsgCount;
      }
  }
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    marginTop: 7,
    borderRadius: 14,
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
  pictureInit: {
    width: 50,
    height: 50,
    borderRadius: 17,
    opacity: 0.3,
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
    width: 80,
    paddingBottom: 3,
    paddingTop: 3,
  },
  timestamp: {
    fontSize: 12,
    color: '#B7B6B6',
  },
  read: {
    display: 'none',
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
