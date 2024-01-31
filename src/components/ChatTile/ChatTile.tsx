import Sending from '@assets/icons/statusIndicators/sending.svg';
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
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
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
      <GenericAvatar
        profileUri={getProfileURI(props.pathToDisplayPic)}
        avatarSize="small"
      />
      <View style={{flex: 1, marginTop: 4}}>
        <View style={styles.textInfoContainer}>
          <NumberlessText
            ellipsizeMode="tail"
            numberOfLines={1}
            fontType={FontType.md}
            style={{
              flex: 1,
              alignSelf: 'stretch',
              marginRight: 10,
            }}
            fontSizeType={FontSizeType.l}>
            {props.name}
          </NumberlessText>

          {props.disconnected ? (
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              style={{
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
                fontType={FontType.rg}
                textColor={PortColors.text.labels}>
                {getReadableTimestamp(props.timestamp)}
              </NumberlessText>
            </View>
          )}
        </View>
        <View style={styles.columnview}>
          {isNewConnection ? (
            <NumberlessText
              ellipsizeMode="tail"
              numberOfLines={1}
              fontType={FontType.md}
              style={{
                flex: 1,
                alignSelf: 'stretch',
              }}
              fontSizeType={FontSizeType.m}
              textColor={PortColors.text.title}>
              New connection
            </NumberlessText>
          ) : (
            <>
              <NumberlessText
                ellipsizeMode="tail"
                numberOfLines={1}
                fontType={FontType.rg}
                fontSizeType={FontSizeType.m}
                style={{
                  flex: 1,
                  alignSelf: 'stretch',
                }}
                textColor={
                  isNewMessage ? undefined : PortColors.text.secondary
                }>
                {props.text}
              </NumberlessText>
              <DisplayStatus {...props} />
            </>
          )}
        </View>
      </View>
    </Pressable>
  ) : (
    <PendingChatTile {...props} />
  );
}

function getProfileURI(fileURI?: string | null) {
  if (fileURI) {
    if (fileURI.includes('avatar://')) {
      return fileURI;
    } else {
      return getSafeAbsoluteURI(fileURI, 'doc');
    }
  } else {
    return undefined;
  }
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
    borderRadius: 14,
    flexDirection: 'row',
    paddingVertical: 16,
    height: 82,
    paddingHorizontal: 16,
  },
  textInfoContainer: {
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',

    flex: 1,
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 3,
  },
  new: {
    backgroundColor: PortColors.primary.red.error,
    height: 20,
    width: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newTextDot: {
    fontSize: 12,
    textAlign: 'center',
    color: '#FFF',
  },
  columnview: {
    alignSelf: 'stretch',
    marginLeft: 12,
    marginTop: 6,
    flex: 1,
    flexDirection: 'row',
  },
});

export default ChatTile;
