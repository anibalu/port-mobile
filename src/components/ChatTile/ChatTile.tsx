import {FontSizes, PortColors, screen} from '@components/ComponentUtils';
import {GenericAvatar} from '@components/GenericAvatar';
import {
  NumberlessMediumText,
  NumberlessRegularText,
  NumberlessSemiBoldText,
} from '@components/NumberlessText';
import {useNavigation} from '@react-navigation/native';
import {
  ConnectionInfo,
  ConnectionType,
  ReadStatus,
} from '@utils/Connections/interfaces';
import {getChatTileTimestamp} from '@utils/Time';
import React, {ReactNode, memo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

function ChatTile(props: ConnectionInfo): ReactNode {
  const navigation = useNavigation<any>();
  //sets profile picture URI
  function chooseProfileURI(): string {
    if (props.pathToDisplayPic && props.pathToDisplayPic !== '') {
      return `file://${props.pathToDisplayPic}`;
    }
    return 'avatar://1';
  }

  //handles navigation to a chat screen and toggles chat to read.
  const handleNavigate = async (): Promise<void> => {
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
        <GenericAvatar profileUri={chooseProfileURI()} avatarSize="small" />
        <View style={styles.metadata}>
          {props.disconnected ? (
            <View
              style={{
                backgroundColor: PortColors.primary.grey.light,
                paddingLeft: 4,
                width: 100,
                justifyContent: 'center',
                flexDirection: 'row',
                paddingVertical: 2,
              }}>
              <NumberlessMediumText
                numberOfLines={1}
                style={styles.disconnectedText}>
                Disconnected
              </NumberlessMediumText>
            </View>
          ) : (
            <NumberlessMediumText style={styles.timestamp}>
              {getChatTileTimestamp(props.timestamp)}
            </NumberlessMediumText>
          )}

          {props?.newMessageCount > 0 && status != ReadStatus.read ? (
            <View style={styles[status]}>
              <NumberlessSemiBoldText style={styles[status]}>
                {displayNumber(props.newMessageCount, status)}
              </NumberlessSemiBoldText>
            </View>
          ) : null}
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
        <GenericAvatar profileUri={chooseProfileURI()} avatarSize="small" />
      </View>
    </Pressable>
  );
}

//returns display string based on new message count
function displayNumber(
  newMsgCount: undefined | number,
  status: string,
): string {
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
        return newMsgCount.toString();
      }
  }
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    marginTop: 7,
    borderRadius: 14,
    backgroundColor: '#FFF9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 15,
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },
  disconnectedText: {
    ...FontSizes[12].medium,
    color: PortColors.primary.red,
  },
  newMessage: {
    backgroundColor: '#FFF',
  },
  newMessageContent: {
    color: PortColors.primary.grey.dark,
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
    maxWidth: screen.width / 1.5,
    justifyContent: 'center',
    alignContent: 'flex-start',
    position: 'absolute',
    paddingLeft: 78,
  },
  nickname: {
    ...FontSizes[17].medium,
    paddingBottom: 3,
  },
  content: {
    color: PortColors.primary.black,
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
    color: PortColors.primary.grey.medium,
  },
  read: {
    display: 'none',
  },
  sent: {
    backgroundColor: PortColors.primary.grey.medium,
    borderRadius: 9,
    width: 9,
    height: 9,
    fontSize: 0,
    paddingBottom: 8,
  },
  seen: {
    backgroundColor: PortColors.primary.blue.light,
    borderRadius: 9,
    width: 9,
    height: 9,
    fontSize: 0,
  },
  new: {
    backgroundColor: PortColors.primary.red,
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

export default memo(ChatTile, (prevProps, nextProps) => {
  return (
    prevProps.readStatus === nextProps.readStatus &&
    prevProps.text === nextProps.text
  );
});
