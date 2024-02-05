import CameraThin from '@assets/icons/CameraThin.svg';
import DocumentThin from '@assets/icons/DocumentThin.svg';
import VideoThin from '@assets/icons/VideoThin.svg';
import Failure from '@assets/icons/statusIndicators/failure.svg';
import Read from '@assets/icons/statusIndicators/read.svg';
import Delivered from '@assets/icons/statusIndicators/received.svg';
import {
  default as Journaled,
  default as Sending,
} from '@assets/icons/statusIndicators/sending.svg';
import Sent from '@assets/icons/statusIndicators/sent.svg';
import {PortColors, screen} from '@components/ComponentUtils';
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
  StoreConnection,
} from '@utils/Connections/interfaces';
import {
  ContentType,
  MessageStatus,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {getMessage} from '@utils/Storage/messages';
import {getReadableTimestamp} from '@utils/Time';
import React, {ReactNode, useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import PendingChatTile from './PendingChatTile';

function ChatTile(initialProps: StoreConnection): ReactNode {
  const navigation = useNavigation<any>();
  const [props, setProps] = useState<ConnectionInfo>(
    JSON.parse(initialProps.stringifiedConnection),
  );
  //handles navigation to a chat screen and toggles chat to read.
  const handleNavigate = (): void => {
    navigation.navigate('DirectChat', {
      chatId: props.chatId,
      isGroupChat: props.connectionType === ChatType.group,
      isConnected: !props.disconnected,
      profileUri: props.pathToDisplayPic,
      latestMessageId: props.latestMessageId,
    });
  };
  const [newMessage, setNewMessage] = useState<SavedMessageParams>();

  const getNewMessage = async (): Promise<void> => {
    const msg = await getMessage(
      JSON.parse(initialProps.stringifiedConnection).chatId,
      JSON.parse(initialProps.stringifiedConnection).latestMessageId,
    );
    if (msg) {
      setNewMessage(msg);
    }
  };

  useEffect(() => {
    setProps(JSON.parse(initialProps.stringifiedConnection));
    getNewMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProps]);

  const messageStatus = () => {
    if (newMessage?.messageStatus === MessageStatus.journaled) {
      return <Journaled />;
    } else if (newMessage?.messageStatus === MessageStatus.read) {
      return <Read />;
    } else if (newMessage?.messageStatus === MessageStatus.delivered) {
      return <Delivered />;
    } else if (newMessage?.messageStatus === MessageStatus.sent) {
      return <Sent />;
    } else if (newMessage?.messageStatus === MessageStatus.failed) {
      return <Failure />;
    }
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
      <View style={{flex: 1}}>
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
                textColor={PortColors.text.secondary}>
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
              <RenderText newMessage={newMessage} isNewMessage={isNewMessage} />
              {isNewMessage ? (
                <DisplayStatus {...props} />
              ) : +newMessage?.sender ? (
                messageStatus()
              ) : null}
            </>
          )}
        </View>
      </View>
    </Pressable>
  ) : (
    <PendingChatTile {...props} />
  );
}

const RenderText = ({
  newMessage,
  isNewMessage,
}: {
  newMessage: SavedMessageParams | undefined;
  isNewMessage: boolean;
}) => {
  return (
    <View style={{flexDirection: 'row', flex: 1}}>
      {newMessage?.contentType === ContentType.image ? (
        <CameraThin style={{marginRight: 4}} />
      ) : newMessage?.contentType === ContentType.video ? (
        <VideoThin style={{marginRight: 4}} />
      ) : newMessage?.contentType === ContentType.file ? (
        <DocumentThin style={{marginRight: 4}} />
      ) : null}
      <NumberlessText
        ellipsizeMode="tail"
        numberOfLines={2}
        style={{width: screen.width * 0.55}}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}
        textColor={isNewMessage ? undefined : PortColors.text.secondary}>
        {newMessage?.data?.text ||
          (newMessage?.contentType === ContentType.image
            ? ' Photo'
            : newMessage?.contentType === ContentType.video
            ? ' Video'
            : newMessage?.contentType === ContentType.file
            ? ' File'
            : null)}
      </NumberlessText>
    </View>
  );
};

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
    padding: 16,
    height: 82,
    borderWidth: 0.5,
    borderColor: PortColors.primary.border.dullGrey,
  },
  textInfoContainer: {
    marginLeft: 12,
    marginTop: -4,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    flexDirection: 'row',
  },
});

export default ChatTile;
