import Failure from '@assets/icons/statusIndicators/failure.svg';
import Read from '@assets/icons/statusIndicators/read.svg';
import Delivered from '@assets/icons/statusIndicators/received.svg';
import {default as Journaled} from '@assets/icons/statusIndicators/sending.svg';
import Sent from '@assets/icons/statusIndicators/sent.svg';
import {PortColors, screen} from '@components/ComponentUtils';
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
import {
  ContactBundleParams,
  ContentType,
  MessageStatus,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {getGroupMessage, getMessage} from '@utils/Storage/messages';
import {getChatTileTimestamp} from '@utils/Time';
import React, {ReactNode, useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {DEFAULT_AVATAR} from '@configs/constants';

export interface ChatTileProps extends ConnectionInfo {
  expired?: boolean;
  isReadPort?: boolean;
}

function ChatTile({
  props,
  setSelectedProps,
}: {
  props: ChatTileProps;
  setSelectedProps: (p: ChatTileProps | null) => void;
}): ReactNode {
  const navigation = useNavigation<any>();
  //handles navigation to a chat screen and toggles chat to read.
  const onClick = (): void => {
    if (props.authenticated) {
      navigation.navigate('DirectChat', {
        chatId: props.chatId,
        isGroupChat: props.connectionType === ChatType.group,
        isConnected: !props.disconnected,
        profileUri: props.pathToDisplayPic || DEFAULT_AVATAR,
        name: props.name,
      });
    } else {
      setSelectedProps(props);
    }
  };

  const [newMessage, setNewMessage] = useState<SavedMessageParams | null>(null);

  const getNewMessage = async (): Promise<void> => {
    if (props.latestMessageId) {
      const msg =
        props.connectionType === ChatType.group
          ? await getGroupMessage(props.chatId, props.latestMessageId)
          : await getMessage(props.chatId, props.latestMessageId);
      setNewMessage(msg);
    }
  };

  useEffect(() => {
    getNewMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  return (
    <Pressable
      style={StyleSheet.compose(
        styles.tile,
        props.readStatus === ReadStatus.new
          ? {backgroundColor: PortColors.primary.white}
          : {backgroundColor: '#FFF9'},
      )}
      onPress={onClick}>
      <AvatarBox profileUri={props.pathToDisplayPic} avatarSize="s+" />
      <View style={{flex: 1}}>
        <View style={styles.textInfoContainer}>
          <NumberlessText
            ellipsizeMode="tail"
            numberOfLines={1}
            fontType={FontType.md}
            style={{
              flex: 1,
              alignSelf: 'stretch',
              marginRight: 12,
            }}
            fontSizeType={FontSizeType.l}>
            {props.name || 'New contact'}
          </NumberlessText>
          <View style={styles.dateAndStatusBox}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              textColor={PortColors.text.body}>
              {getChatTileTimestamp(props.timestamp)}
            </NumberlessText>
          </View>
        </View>
        <View style={styles.columnview}>
          {props.disconnected ? (
            <NumberlessText
              ellipsizeMode="tail"
              numberOfLines={1}
              fontType={FontType.rg}
              style={{
                flex: 1,
                alignSelf: 'stretch',
              }}
              fontSizeType={FontSizeType.m}
              textColor={PortColors.primary.red.error}>
              Disconnected
            </NumberlessText>
          ) : (
            <>
              {props.authenticated ? (
                <>
                  {props.recentMessageType === ContentType.newChat ? (
                    <NumberlessText
                      ellipsizeMode="tail"
                      numberOfLines={1}
                      fontType={FontType.rg}
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
                      <RenderText newMessage={newMessage} />
                      <DisplayStatus
                        readStatus={props.readStatus}
                        newMessageCount={props.newMessageCount}
                        newMessage={newMessage}
                      />
                    </>
                  )}
                </>
              ) : (
                <>
                  {
                    //if not authenticated yet, could be a read port
                    props.expired ? (
                      <>
                        <NumberlessText
                          ellipsizeMode="tail"
                          numberOfLines={2}
                          fontType={FontType.rg}
                          style={{
                            flex: 1,
                            alignSelf: 'stretch',
                          }}
                          fontSizeType={FontSizeType.m}
                          textColor={PortColors.primary.red.error}>
                          Failed to add this contact. You used an expired Port.
                        </NumberlessText>
                      </>
                    ) : (
                      <>
                        <NumberlessText
                          ellipsizeMode="tail"
                          numberOfLines={1}
                          fontType={FontType.rg}
                          style={{
                            flex: 1,
                            alignSelf: 'stretch',
                          }}
                          fontSizeType={FontSizeType.m}
                          textColor={PortColors.text.title}>
                          Adding new contact...
                        </NumberlessText>
                      </>
                    )
                  }
                </>
              )}
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const RenderText = ({
  newMessage,
}: {
  newMessage: SavedMessageParams | undefined | null;
}) => {
  let text = '';
  if (newMessage && newMessage.data) {
    text = newMessage.data.text ? newMessage.data.text : '';
    if (newMessage.contentType === ContentType.image) {
      if (text === '') {
        text = '📷 image';
      } else {
        text = '📷 ' + text;
      }
    } else if (newMessage.contentType === ContentType.video) {
      if (text === '') {
        text = '🎥 video';
      } else {
        text = '🎥 ' + text;
      }
    } else if (newMessage.contentType === ContentType.file) {
      if (text === '') {
        text = '📎 file';
      } else {
        text = '📎 ' + text;
      }
    } else if (newMessage.contentType === ContentType.contactBundle) {
      text = '👤 ' + (newMessage.data as ContactBundleParams).name;
    }
    return (
      <View style={{flexDirection: 'row', flex: 1}}>
        <NumberlessText
          ellipsizeMode="tail"
          numberOfLines={2}
          style={{width: screen.width - 160}}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}
          textColor={PortColors.subtitle}>
          {text}
        </NumberlessText>
      </View>
    );
  }
  return (
    <View style={{flexDirection: 'row', flex: 1}}>
      <NumberlessText
        ellipsizeMode="tail"
        numberOfLines={2}
        style={{width: screen.width - 160}}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}
        textColor={PortColors.subtitle}>
        {text}
      </NumberlessText>
    </View>
  );
};

function DisplayStatus({
  readStatus,
  newMessageCount,
  newMessage,
}: {
  readStatus: ReadStatus;
  newMessageCount: number;
  newMessage: SavedMessageParams | undefined | null;
}): ReactNode {
  const MessageStatusIndicator = () => {
    if (
      newMessage &&
      newMessage.messageStatus !== null &&
      newMessage.messageStatus !== undefined &&
      newMessage.sender
    ) {
      switch (newMessage.messageStatus) {
        case MessageStatus.journaled:
          return <Journaled />;
        case MessageStatus.read:
          return <Read />;
        case MessageStatus.delivered:
          console.log('running case');
          return <Delivered />;
        case MessageStatus.sent:
          return <Sent />;
        case MessageStatus.failed:
          return <Failure />;
        default:
          return <></>;
      }
    }
    return <></>;
  };
  if (readStatus === ReadStatus.new) {
    if (newMessageCount > 0) {
      return (
        <View style={{paddingTop: 4}}>
          <View style={styles.new}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}
              textColor={PortColors.text.primaryWhite}>
              {displayNumber(newMessageCount)}
            </NumberlessText>
          </View>
        </View>
      );
    } else {
      return null;
    }
  } else {
    return (
      <View style={{paddingTop: 4}}>
        <View style={styles.indicatorBox}>
          <MessageStatusIndicator />
        </View>
      </View>
    );
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
    height: 90,
    borderWidth: 0.5,
    borderColor: PortColors.primary.border.dullGrey,
  },
  textInfoContainer: {
    marginLeft: 12,
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
    backgroundColor: PortColors.primary.blue.app,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    minWidth: 20,
  },
  indicatorBox: {
    height: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 4,
    minWidth: 20,
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
