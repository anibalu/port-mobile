import {SafeAreaView} from '@components/SafeAreaView';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, Vibration} from 'react-native';

import ChatBackground from '@components/ChatBackground';
import DeleteChatButton from '@components/DeleteChatButton';
import {
  DEFAULT_AVATAR,
  SELECTED_MESSAGES_LIMIT,
  START_OF_TIME,
} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
import Clipboard from '@react-native-clipboard/clipboard';
//import store from '@store/appStore';
import {toggleRead} from '@utils/Connections';
import {
  ContentType,
  LargeDataParams,
  MessageStatus,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {
  getMessage,
  readPaginatedMessages,
  getLatestMessages,
} from '@utils/Storage/messages';

import DirectChat from '@utils/DirectChats/DirectChat';
import Group from '@utils/Groups/Group';
import sendJournaled from '@utils/Messaging/Send/sendJournaled';
import {useSelector} from 'react-redux';
import {useErrorModal} from 'src/context/ErrorModalContext';
import ChatList from './ChatList';
import ChatTopbar from './ChatTopbar';
import {MessageActionsBar} from './MessageActionsBar';
import MessageBar from './MessageBar';
import {handleAsyncMediaDownload as groupMedia} from '@utils/Messaging/Receive/ReceiveGroup/HandleMediaDownload';
import {handleAsyncMediaDownload as directMedia} from '@utils/Messaging/Receive/ReceiveDirect/HandleMediaDownload';

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
  const {chatId, isGroupChat, isConnected, profileUri} = route.params;

  //Datahandler contains functions about the group, if it is a group, else the DM.
  const dataHandler = useMemo(() => {
    return isGroupChat ? new Group(chatId) : new DirectChat(chatId);
  }, [isGroupChat, chatId]);

  const [cursor, setCursor] = useState(0);

  const [chatState, setChatState] = useState({
    name: '',
    groupInfo: {},
    profileURI: profileUri,
    connectionConnected: isConnected,
    messagesLoaded: false,
  });

  const {copyingMessageError, messageCopied, mediaDownloadError} =
    useErrorModal();

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
    state => state.latestMessageUpdate.updatedStatus,
  );
  const latestUpdatedMediaStatus: any = useSelector(
    state => state.latestMessageUpdate.updatedMedia,
  );

  //handles toggling the select messages flow.
  const handleMessageBubbleLongPress = (messageId: string): void => {
    //adds messageId to selected messages on long press and vibrates
    Vibration.vibrate(30);
    if (!selectedMessages.includes(messageId)) {
      setSelectedMessages([...selectedMessages, messageId]);
    }
  };

  //Handles selecting messages once select messages flow is toggled
  const handleMessageBubbleShortPress = (
    messageId: string,
  ): SelectedMessagesSize => {
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

  const updateChatState = (newState: any) => {
    setChatState(prevState => ({...prevState, ...newState}));
  };

  const updateAfterDeletion = (messageIds: string[]): void => {
    setMessages(messages =>
      messages.filter(message => !messageIds.includes(message.messageId)),
    );
    setSelectedMessages([]);
  };

  const onCopy = useCallback(async () => {
    let copyString = '';
    messageCopied();
    for (const message of selectedMessages) {
      const msg = await getMessage(chatId, message);
      switch (msg?.contentType) {
        case ContentType.text: {
          //Formatting multiple messages into a single string.
          copyString += msg?.data.text;
          setSelectedMessages([]);
          break;
        }
        default:
          //throw new Error('Unsupported copy type');
          break;
      }
    }
    Clipboard.setString(copyString);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedMessages,
    chatState,
    chatId,
    messageCopied,
    dataHandler,
    isGroupChat,
  ]);

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
        const localState: any = {};
        if (isGroupChat) {
          localState.isGroupChat = true;
          const groupData = await (dataHandler as Group).getData();
          localState.groupInfo = groupData;
          localState.name = groupData?.name;
          localState.profileURI = groupData?.groupPicture
            ? groupData?.groupPicture
            : DEFAULT_AVATAR;
        } else {
          localState.isGroupChat = false;
          const chatData = await (dataHandler as DirectChat).getChatData();
          localState.name = chatData.name;
          localState.profileURI = chatData.displayPic
            ? chatData.displayPic
            : DEFAULT_AVATAR;
        }

        //toggle chat as read
        await toggleRead(chatId);
        await sendJournaled();
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
      if (isGroupChat) {
        const groupHandler = new Group(chatId);
        updateChatState({groupInfo: await groupHandler.getData()});
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

  //Runs every time a sent message's media status is updated.
  useEffect(() => {
    (async () => {
      if (chatState.messagesLoaded) {
        await updateMedia(messages);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestUpdatedMediaStatus]);

  const updateMedia = async (msgs: SavedMessageParams[]): Promise<void> => {
    const indices: number[] = [];
    msgs.forEach((element, index) => {
      if (
        element.contentType === ContentType.file ||
        element.contentType === ContentType.video ||
        element.contentType === ContentType.image
      ) {
        indices.push(index);
      }
    });
    for (const i of indices) {
      const msg = await getMessage(chatId, msgs[i].messageId);
      if (
        msg &&
        (msgs[i].data as LargeDataParams).fileUri !=
          (msg.data as LargeDataParams).fileUri
      ) {
        msgs[i] = msg;
      }
    }
    setMessages([...msgs]);
  };

  const updateMessages = async (msgs: SavedMessageParams[]): Promise<void> => {
    const indices: number[] = [];
    msgs.forEach((element, index) => {
      if (
        element.messageStatus !== MessageStatus.sent &&
        element.messageStatus !== null
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
    setMessages([...msgs]);
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

  const onSettingsPressed = (): void => {
    if (isGroupChat) {
      navigation.navigate('GroupProfile', {groupId: chatId});
    } else {
      navigation.navigate('ContactProfile', {chatId: chatId});
    }
  };

  const handleDownload = async (messageId: string) => {
    try {
      if (isGroupChat) {
        await groupMedia(chatId, messageId);
      } else {
        await directMedia(chatId, messageId);
      }
    } catch (e) {
      console.log('Error handling manual download:', e);
      mediaDownloadError();
    }
  };

  const onBackPress = async (): Promise<void> => {
    setSelectedMessages([]);
    await toggleRead(chatId);
    navigation.navigate('HomeTab');
  };

  const onCancelPressed = () => {
    setSelectedMessages([]);
  };

  const onDelete = () => {
    if (isGroupChat) {
      (dataHandler as Group).deleteGroup();
    } else {
      (dataHandler as DirectChat).delete();
    }
    navigation.navigate('HomeTab');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ChatBackground />
      <ChatTopbar
        name={chatState.name}
        profileURI={chatState.profileURI}
        selectedMessagesLength={selectedMessages.length}
        onSettingsPressed={onSettingsPressed}
        onBackPress={onBackPress}
        onCancelPressed={onCancelPressed}
      />
      <ChatList
        messages={messages}
        allowScrollToTop={enableAutoscrollToTop}
        onStartReached={onStartReached}
        selectedMessages={selectedMessages}
        handlePress={handleMessageBubbleShortPress}
        handleLongPress={handleMessageBubbleLongPress}
        handleDownload={handleDownload}
        isGroupChat={isGroupChat}
        dataHandler={dataHandler}
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
              isGroupChat={isGroupChat}
            />
          )}
        </>
      ) : (
        <DeleteChatButton onDelete={onDelete} />
      )}
    </SafeAreaView>
  );
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
