import {SafeAreaView} from '@components/SafeAreaView';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {Image, StyleSheet, Vibration} from 'react-native';

import DefaultImage from '@assets/avatars/avatar.png';
import ChatBackground from '@components/ChatBackground';
import DeleteChatButton from '@components/DeleteChatButton';
import {
  DEFAULT_NAME,
  SELECTED_MESSAGES_LIMIT,
  START_OF_TIME,
} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
import Clipboard from '@react-native-clipboard/clipboard';
//import store from '@store/appStore';
import {getConnection, toggleRead} from '@utils/Connections';
import {ConnectionType} from '@utils/Connections/interfaces';
import {extractMemberInfo} from '@utils/Groups';
import {
  ContentType,
  SavedMessageParams,
  SendStatus,
} from '@utils/Messaging/interfaces';
import {tryToSendJournaled} from '@utils/Messaging/sendMessage';
import {getLatestMessages} from '@utils/Storage/DBCalls/lineMessage';
import {getGroupInfo} from '@utils/Storage/group';
import {getMessage, readPaginatedMessages} from '@utils/Storage/messages';
//import {debounce} from 'lodash';
import ChatList from './ChatList';
import ChatTopbar from './ChatTopbar';
import {MessageActionsBar} from './MessageActionsBar';
import MessageBar from './MessageBar';
import {useSelector} from 'react-redux';
import {useErrorModal} from 'src/context/ErrorModalContext';

type Props = NativeStackScreenProps<AppStackParamList, 'DirectChat'>;
export enum SelectedMessagesSize {
  empty,
  notEmpty,
}
/**
 * Renders a chat screen. The chatlist that is rendered is INVERTED, which means that any `top` function is a `bottom` function and vice versa.
 * @returns Component for rendered chat window
 */
function Chat({route, navigation}: Props) {
  //gets lineId of chat
  const {chatId} = route.params;

  const [cursor, setCursor] = useState(0);
  const [chatState, setChatState] = useState({
    name: '',
    isGroupChat: false,
    groupInfo: {},
    profileURI: Image.resolveAssetSource(DefaultImage).uri,
    connectionConnected: true,
    messagesLoaded: false,
  });

  const {copyingMessageError} = useErrorModal();

  const [messages, setMessages] = useState<Array<SavedMessageParams>>([]);

  //Allows for message auto-scrolling in the list. Set to true as list is INVERTED.
  const [enableAutoscrollToTop, setEnableAutoscrollToTop] = useState(true);

  //selected messages
  const [selectedMessages, setSelectedMessages] = useState<Array<string>>([]);
  //message to be replied
  const [replyToMessage, setReplyToMessage] = useState<SavedMessageParams>();

  const latestReceivedMessage: any = useSelector(
    state => state.latestReceivedMessage.content.data,
  );
  const latestSentMessage: any = useSelector(
    state => state.latestSentMessage.message,
  );
  const latestUpdatedSendStatus: any = useSelector(
    state => state.latestSendStatusUpdate.updated,
  );

  //handles toggling the select messages flow.
  const handleMessageBubbleLongPress = (messageId: string): void => {
    //adds messageId to selected messages on long press and vibrates
    Vibration.vibrate(50);
    if (!selectedMessages.includes(messageId)) {
      setSelectedMessages([...selectedMessages, messageId]);
    }
  };

  //Handles selecting messages once select messages flow is toggled
  const handleMessageBubbleShortPress = (messageId: string): void => {
    // removes messageId from selected messages on short press
    let selectedMessagesSize: SelectedMessagesSize =
      selectedMessages.length >= 1
        ? SelectedMessagesSize.notEmpty
        : SelectedMessagesSize.empty;
    if (selectedMessages.includes(messageId)) {
      setSelectedMessages(
        selectedMessages.filter(
          selectedMessageId => selectedMessageId !== messageId,
        ),
      );
    } else {
      //makes short press select a message if atleast one message is already selected.
      if (selectedMessages.length >= 1) {
        if (selectedMessages.length >= SELECTED_MESSAGES_LIMIT) {
          copyingMessageError();
        } else {
          setSelectedMessages([...selectedMessages, messageId]);
        }
      }
    }
    return selectedMessagesSize;
  };

  const updateChatState = useCallback(newState => {
    setChatState(prevState => ({...prevState, ...newState}));
  }, []);

  const updateAfterDeletion = (messageIds: string[]): void => {
    setMessages(messages =>
      messages.filter(message => !messageIds.includes(message.messageId)),
    );
    setSelectedMessages([]);
  };

  const onCopy = useCallback(async () => {
    let copyString = '';
    for (const message of selectedMessages) {
      const msg = await getMessage(chatId, message);
      switch (msg?.contentType) {
        case ContentType.text: {
          //Formatting multiple messages into a single string.
          copyString += `[${msg?.timestamp}] : [${
            chatState.isGroupChat
              ? findMemberName(
                  extractMemberInfo(chatState.groupInfo, msg.memberId),
                )
              : chatState.name
          }] : [${msg?.data.text}]`;
          break;
        }
        default:
          //throw new Error('Unsupported copy type');
          break;
      }
    }
    Clipboard.setString(copyString);
  }, [selectedMessages, chatState, chatId]);

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
    useCallback(() => {
      (async () => {
        const connection = await getConnection(chatId);
        const localState: any = {};
        if (connection.pathToDisplayPic && connection.pathToDisplayPic !== '') {
          localState.profileURI = `file://${connection.pathToDisplayPic}`;
        }
        localState.name = connection.name;
        if (connection.connectionType === ConnectionType.group) {
          localState.isGroupChat = true;
          localState.groupInfo = await getGroupInfo(chatId);
        }
        //sets connection connected state
        localState.connectionConnected = !connection.disconnected;

        //toggle chat as read
        await toggleRead(chatId);
        await tryToSendJournaled();
        //set saved messages
        const resp = await readPaginatedMessages(chatId);
        setMessages(resp.messages);
        setCursor(resp.cursor);

        //Notifying that initial message load is complete.
        localState.messagesLoaded = true;
        updateChatState(localState);
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  //runs every time a new message is recieved.
  useEffect(() => {
    (async () => {
      if (chatState.isGroupChat) {
        updateChatState({groupInfo: await getGroupInfo(chatId)});
      }
      //If messages have been loaded and the check fails, we need to fetch the latest messages only.
      if (chatState.messagesLoaded) {
        await addNewMessages();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestReceivedMessage]);

  //Runs every time a message is sent into the queue.
  useEffect(() => {
    (async () => {
      if (chatState.messagesLoaded) {
        await addNewMessages();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestSentMessage]);

  //Runs every time a sent message's send status is updated.
  useEffect(() => {
    (async () => {
      if (chatState.messagesLoaded) {
        await updateMessages(messages);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestUpdatedSendStatus]);

  const updateMessages = async (msgs: SavedMessageParams[]): Promise<void> => {
    const indices: number[] = [];
    msgs.forEach((element, index) => {
      if (
        element.sendStatus !== SendStatus.success &&
        element.sendStatus !== null
      ) {
        indices.push(index);
      }
    });
    for (const i of indices) {
      const msg = await getMessage(chatId, msgs[i].messageId);
      if (msg) {
        msgs[i] = msg;
      }
    }
    setMessages(msgs);
  };

  const addNewMessages = async (): Promise<void> => {
    if (messages.length >= 1) {
      const messageList = await getLatestMessages(
        chatId,
        messages[0].timestamp,
      );
      const newList = messageList.concat(messages);
      await updateMessages(newList);
    } else {
      const messageList = await getLatestMessages(chatId, START_OF_TIME);
      const newList = messageList.concat(messages);
      await updateMessages(newList);
    }
  };

  const onStartReached = async (): Promise<void> => {
    const resp = await readPaginatedMessages(chatId, cursor);
    setMessages(oldList => oldList.concat(resp.messages));
    //When this is called, the user has reached the top and a new message should autoscroll them down.
    if (cursor == 0) {
      !enableAutoscrollToTop && setEnableAutoscrollToTop(false);
    }
    setCursor(resp.cursor);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ChatBackground />
      <ChatTopbar
        name={chatState.name}
        chatId={chatId}
        profileURI={chatState.profileURI}
        selectedMessages={selectedMessages}
        setSelectedMessages={setSelectedMessages}
        isGroupChat={chatState.isGroupChat}
      />
      <ChatList
        messages={messages}
        allowScrollToTop={enableAutoscrollToTop}
        onStartReached={onStartReached}
        selectedMessages={selectedMessages}
        handlePress={handleMessageBubbleShortPress}
        handleLongPress={handleMessageBubbleLongPress}
        isGroupChat={chatState.isGroupChat}
        groupInfo={chatState.groupInfo}
      />
      {chatState.connectionConnected ? (
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
              name={chatState.name}
              onSend={clearSelected}
              chatId={chatId}
              replyTo={replyToMessage}
              setReplyTo={setReplyToMessage}
              isGroupChat={chatState.isGroupChat}
              groupInfo={chatState.groupInfo}
            />
          )}
        </>
      ) : (
        <DeleteChatButton chatId={chatId} />
      )}
    </SafeAreaView>
  );
}

/**
 * @param memberInfo, object containing details about a member
 * @returns {string}, member name if present
 */
function findMemberName(memberInfo: any): string {
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
