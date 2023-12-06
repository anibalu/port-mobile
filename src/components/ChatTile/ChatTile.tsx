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
import PendingChatTile from './PendingChatTile';
import Sending from '@assets/icons/sending.svg';

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

  return props.authenticated ||
    props.connectionType === ConnectionType.group ? (
    <Pressable
      style={
        props.readStatus === ReadStatus.new
          ? StyleSheet.compose(styles.tile, styles.newMessage)
          : styles.tile
      }
      onPress={handleNavigate}>
      <View style={styles.dpBox}>
        <GenericAvatar profileUri={chooseProfileURI()} avatarSize="small" />
      </View>
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
      <View style={styles.metadata}>
        {props.disconnected ? (
          <View style={styles.disconnectedBox}>
            <NumberlessMediumText style={styles.disconnectedText}>
              Disconnected
            </NumberlessMediumText>
          </View>
        ) : (
          <View style={styles.dateAndStatusBox}>
            <NumberlessMediumText style={styles.timestamp}>
              {getChatTileTimestamp(props.timestamp)}
            </NumberlessMediumText>
            <DisplayStatus {...props} />
          </View>
        )}
      </View>
    </Pressable>
  ) : (
    <PendingChatTile {...props} />
  );
}

function DisplayStatus(props: ConnectionInfo) {
  switch (props.readStatus) {
    case ReadStatus.new:
      return (
        <View style={styles.new}>
          <NumberlessSemiBoldText style={styles.newTextDot}>
            {displayNumber(props.newMessageCount)}
          </NumberlessSemiBoldText>
        </View>
      );
    case ReadStatus.read:
      return null;
    case ReadStatus.sent:
      return null;
    case ReadStatus.journaled:
      return <Sending />;
    default:
      return null;
  }
}

//returns display string based on new message count
function displayNumber(newMsgCount: undefined | null | number): string {
  if (!newMsgCount || newMsgCount === 0) {
    return 'New';
  } else {
    if (newMsgCount > 999) {
      return '999+';
    }
    return newMsgCount.toString();
  }
}

const styles = StyleSheet.create({
  tile: {
    width: screen.width - 20,
    marginTop: 7,
    borderRadius: 14,
    backgroundColor: '#FFF9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    paddingTop: 15,
  },
  newMessage: {
    backgroundColor: '#FFF',
  },
  dpBox: {
    width: 80,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disconnectedText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#FFF',
    backgroundColor: PortColors.primary.red.error,
    padding: 4,
    borderRadius: 5,
  },
  newMessageContent: {
    color: PortColors.primary.grey.dark,
  },
  text: {
    width: screen.width - 20 - 80 - 100,
    justifyContent: 'center',
    alignContent: 'flex-start',
  },
  nickname: {
    ...FontSizes[17].medium,
    marginBottom: 3,
  },
  content: {
    color: PortColors.primary.black,
  },
  metadata: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 100,
    height: 50,
  },
  dateAndStatusBox: {
    maxWidth: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingRight: 15,
  },
  disconnectedBox: {
    maxWidth: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 15,
  },
  timestamp: {
    fontSize: 12,
    color: PortColors.primary.grey.medium,
  },
  new: {
    backgroundColor: PortColors.primary.red.error,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    borderRadius: 19,
  },
  newTextDot: {
    fontSize: 10,
    textAlign: 'center',
    color: '#FFF',
  },
});

export default memo(ChatTile, (prevProps, nextProps) => {
  return (
    prevProps.readStatus === nextProps.readStatus &&
    prevProps.text === nextProps.text &&
    prevProps.newMessageCount === nextProps.newMessageCount &&
    prevProps.authenticated === nextProps.authenticated &&
    prevProps.disconnected === nextProps.disconnected &&
    prevProps.connectionType === nextProps.connectionType
  );
});
