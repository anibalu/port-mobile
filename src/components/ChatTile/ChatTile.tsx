import Sending from '@assets/icons/sending.svg';
import {PortColors} from '@components/ComponentUtils';
import {GenericAvatar} from '@components/GenericAvatar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useNavigation} from '@react-navigation/native';
import {
  ChatType,
  ConnectionInfo,
  ReadStatus,
} from '@utils/Connections/interfaces';
import {ContentType} from '@utils/Messaging/interfaces';
import {getReadableTimestamp} from '@utils/Time';
import React, {ReactNode} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import PendingChatTile from './PendingChatTile';

function ChatTile(props: ConnectionInfo): ReactNode {
  const navigation = useNavigation<any>();

  //handles navigation to a chat screen and toggles chat to read.
  const handleNavigate = (): void => {
    navigation.navigate('DirectChat', {
      chatId: props.chatId,
      isGroupChat: props.connectionType === ChatType.group,
      isConnected: !props.disconnected,
      profileUri: props.pathToDisplayPic,
    });
  };
  const isNewMessage = props.readStatus === ReadStatus.new;
  const isNewConnection = props.recentMessageType === ContentType.newChat;

  return props.authenticated || props.connectionType === ChatType.group ? (
    <Pressable
      style={StyleSheet.compose(
        styles.tile,
        isNewMessage
          ? {backgroundColor: PortColors.primary.white}
          : {backgroundColor: '#FFF9'},
      )}
      onPress={handleNavigate}>
      <GenericAvatar profileUri={props.pathToDisplayPic} avatarSize="small" />

      <View style={styles.textInfoContainer}>
        <NumberlessText
          ellipsizeMode="tail"
          numberOfLines={1}
          fontType={FontType.md}
          style={{marginBottom: 4}}
          fontSizeType={FontSizeType.l}>
          {props.name}
        </NumberlessText>

        {isNewConnection ? (
          <NumberlessText
            ellipsizeMode="tail"
            numberOfLines={1}
            fontType={FontType.md}
            fontSizeType={FontSizeType.m}
            textColor={PortColors.text.title}>
            New connection
          </NumberlessText>
        ) : (
          <NumberlessText
            ellipsizeMode="tail"
            numberOfLines={1}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}
            textColor={isNewMessage ? undefined : PortColors.text.secondary}>
            {props.text}
          </NumberlessText>
        )}
      </View>
      <View style={styles.metadataContainer}>
        {props.disconnected ? (
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.md}
            style={{
              backgroundColor: PortColors.primary.grey.light,
              marginHorizontal: 6,
              paddingHorizontal: 4,
              borderRadius: 4,
              paddingVertical: 3,
            }}
            textColor={PortColors.text.delete}>
            Disconnected
          </NumberlessText>
        ) : (
          <View style={styles.dateAndStatusBox}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.md}
              textColor={PortColors.text.labels}>
              {getReadableTimestamp(props.timestamp)}
            </NumberlessText>
            <DisplayStatus {...props} />
          </View>
        )}
      </View>
    </Pressable>
  ) : (
    <PendingChatTile {...props} />
  );
}

function DisplayStatus(props: ConnectionInfo): ReactNode {
  switch (props.readStatus) {
    case ReadStatus.new:
      if (props.newMessageCount > 0) {
        return (
          <View style={styles.new}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.md}
              textColor={PortColors.text.primaryWhite}>
              {displayNumber(props.newMessageCount)}
            </NumberlessText>
          </View>
        );
      } else {
        return null;
      }

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
function displayNumber(newMsgCount: number): string {
  if (newMsgCount > 999) {
    return '999+';
  }
  return newMsgCount.toString();
}

const styles = StyleSheet.create({
  tile: {
    marginTop: 7,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    height: 89,
    paddingLeft: 15,
  },
  textInfoContainer: {
    alignContent: 'flex-start',
    flex: 1,
    marginLeft: 19,
  },
  metadataContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 50,
    paddingLeft: 5,
  },
  dateAndStatusBox: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingRight: 15,
  },
  new: {
    backgroundColor: PortColors.primary.red.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  newTextDot: {
    fontSize: 10,
    textAlign: 'center',
    color: '#FFF',
  },
});

export default ChatTile;
