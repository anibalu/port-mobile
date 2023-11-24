import {SafeAreaView} from '@components/SafeAreaView';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {Image, StyleSheet} from 'react-native';

import DefaultImage from '@assets/avatars/avatar.png';
import ChatBackground from '@components/ChatBackground';
import DeleteChatButton from '@components/DeleteChatButton';
import {DEFAULT_NAME} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
import Clipboard from '@react-native-clipboard/clipboard';
import store from '@store/appStore';
import {getConnection, toggleRead} from '@utils/Connections';
import {ConnectionType} from '@utils/Connections/interfaces';
import {extractMemberInfo} from '@utils/Groups';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {tryToSendJournaled} from '@utils/Messaging/sendMessage';
import {getGroupInfo} from '@utils/Storage/group';
import {getMessage, readMessages} from '@utils/Storage/messages';
import ChatList from './ChatList';
import ChatTopbar from './ChatTopbar';
import {MessageActionsBar} from './MessageActionsBar';
import MessageBar from './MessageBar';

type Props = NativeStackScreenProps<AppStackParamList, 'DirectChat'>;
/**
 * Renders a chat screen.
 * @returns Component for rendered chat window
 */
function Chat({route, navigation}: Props) {
  //gets lineId of chat
  const {chatId} = route.params;
  //Name to be displayed in topbar
  const [name, setName] = useState('');
  const [isGroupChat, setIsGroupChat] = useState<boolean>(false);
  const [groupInfo, setGroupInfo] = useState({});
  const [messages, setMessages] = useState<Array<SavedMessageParams>>([]);
  //selected messages
  const [selectedMessages, setSelectedMessages] = useState<Array<string>>([]);
  //message to be replied
  const [replyToMessage, setReplyToMessage] = useState<SavedMessageParams>();
  // Track whether the connection is disconnected
  const [connectionConnected, setConnectionConnected] = useState(true);
  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );

  //handles selecting messages
  const handleMessageBubbleLongPress = (messageId: string) => {
    //adds messageId to selected messages on long press
    if (!selectedMessages.includes(messageId)) {
      setSelectedMessages([...selectedMessages, messageId]);
    }
  };
  const handleMessageBubbleShortPress = (messageId: string) => {
    // removes messageId from selected messages on short press
    if (selectedMessages.includes(messageId)) {
      setSelectedMessages(
        selectedMessages.filter(
          selectedMessageId => selectedMessageId !== messageId,
        ),
      );
    } else {
      //makes short press select a message if atleast one message is already selected.
      if (selectedMessages.length >= 1) {
        setSelectedMessages([...selectedMessages, messageId]);
      }
    }
  };

  //Removes selected messages post deletion
  const updateAfterDeletion = (messageIds: string[]) => {
    setMessages(messages =>
      messages.filter(message => !messageIds.includes(message.messageId)),
    );
    setSelectedMessages([]);
  };

  const onCopy = async () => {
    let copyString = '';
    for (const message of selectedMessages) {
      const msg = await getMessage(chatId, message);
      switch (msg?.contentType) {
        case ContentType.text: {
          copyString += `[${msg?.timestamp}] : [${
            isGroupChat
              ? findMemberName(extractMemberInfo(groupInfo, msg.memberId))
              : name
          }] : [${msg?.data.text}]`;
          break;
        }
        default:
          throw new Error('Unsupported copy type');
      }
    }
    Clipboard.setString(copyString);
  };

  const onForward = () => {
    navigation.navigate('ForwardToContact', {
      chatId: chatId,
      messages: selectedMessages,
      setSelectedMessages: setSelectedMessages,
    });
  };

  const clearSelected = () => {
    setReplyToMessage(undefined);
    setSelectedMessages([]);
  };

  //effect runs when screen is focused
  //retrieves name of connection
  //toggles messages as read
  //reads intial messages from messages storage.
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const connection = await getConnection(chatId);
        if (connection.pathToDisplayPic && connection.pathToDisplayPic !== '') {
          setProfileURI(`file://${connection.pathToDisplayPic}`);
        }
        //set connection name
        setName(connection.name);
        if (connection.connectionType === ConnectionType.group) {
          setIsGroupChat(true);
          setGroupInfo(await getGroupInfo(chatId));
        }
        //sets connection connected state
        setConnectionConnected(!connection.disconnected);
        //toggle chat as read
        await toggleRead(chatId);
        await tryToSendJournaled();
        //set saved messages
        setMessages(await readMessages(chatId));
      })();
      return () => {
        //toggle chat as read
        (async () => {
          await toggleRead(chatId);
        })();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  //sets up a subscriber to the message store when screen is focused.
  //subscriber runs every time a new message is sent or recieved.
  //chat is automatically toggled as read.
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = store.subscribe(async () => {
        //set latest messages
        if (isGroupChat) {
          setGroupInfo(await getGroupInfo(chatId));
        }
        setMessages(await readMessages(chatId));
      });
      // Clean up the subscription when the screen loses focus
      return () => {
        unsubscribe();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  //A reference to the flatlist that displays messages
  const flatList = React.useRef(null);
  return (
    <SafeAreaView style={styles.screen}>
      <ChatBackground />
      <ChatTopbar
        name={name}
        chatId={chatId}
        profileURI={profileURI}
        selectedMessages={selectedMessages}
        setSelectedMessages={setSelectedMessages}
        isGroupChat={isGroupChat}
      />
      <ChatList
        messages={messages}
        flatList={flatList}
        selectedMessages={selectedMessages}
        handlePress={handleMessageBubbleShortPress}
        handleLongPress={handleMessageBubbleLongPress}
        isGroupChat={isGroupChat}
        groupInfo={groupInfo}
      />
      {connectionConnected ? (
        <>
          {selectedMessages.length > 0 && replyToMessage === undefined ? (
            <MessageActionsBar
              chatId={chatId}
              onCopy={onCopy}
              onForward={onForward}
              selectedMessages={selectedMessages}
              setReplyTo={setReplyToMessage}
              postDelete={updateAfterDeletion}
            />
          ) : (
            <MessageBar
              name={name}
              onSend={clearSelected}
              chatId={chatId}
              replyTo={replyToMessage}
              setReplyTo={setReplyToMessage}
              flatlistRef={flatList}
              listLen={messages.length}
              isGroupChat={isGroupChat}
              groupInfo={groupInfo}
            />
          )}
        </>
      ) : (
        <DeleteChatButton chatId={chatId} />
      )}
    </SafeAreaView>
  );
}

function findMemberName(memberInfo: any) {
  if (memberInfo.memberId) {
    return memberInfo.name || DEFAULT_NAME;
  }
  return '';
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
  },
  chatBubble: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

export default Chat;
