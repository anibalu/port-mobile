import {SafeAreaView} from '@components/SafeAreaView';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, Vibration} from 'react-native';

import ChatBackground from '@components/ChatBackground';
import DeleteChatButton from '@components/DeleteChatButton';
import {DEFAULT_AVATAR, SELECTED_MESSAGES_LIMIT} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
import Clipboard from '@react-native-clipboard/clipboard';
//import store from '@store/appStore';
import {toggleRead} from '@utils/Connections';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {getMessage, readPaginatedMessages} from '@utils/Storage/messages';

import store from '@store/appStore';
import {debouncedPeriodicOperations} from '@utils/AppOperations';
import DirectChat from '@utils/DirectChats/DirectChat';
import Group from '@utils/Groups/Group';
import {handleAsyncMediaDownload as directMedia} from '@utils/Messaging/Receive/ReceiveDirect/HandleMediaDownload';
import {handleAsyncMediaDownload as groupMedia} from '@utils/Messaging/Receive/ReceiveGroup/HandleMediaDownload';
import {useSelector} from 'react-redux';
import {useErrorModal} from 'src/context/ErrorModalContext';
import ChatList from './ChatList';
import ChatTopbar from './ChatTopbar';
import {MessageActionsBar} from './MessageActionsBar';
import MessageBar from './MessageBar';

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
  console.log('Re-rendered chat ');

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

  const [messages, setMessages] = useState<SavedMessageParams[]>([]);

  //selected messages
  const [selectedMessages, setSelectedMessages] = useState<Array<string>>([]);
  //message to be replied
  const [replyToMessage, setReplyToMessage] = useState<SavedMessageParams>();

  const latestReceivedMessage: any = useSelector(
    state => state.latestReceivedMessage.latestReceivedMessage,
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

  const onCopy = async () => {
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
  };

  const onForward = () => {
    navigation.navigate('ForwardToContact', {
      chatId: chatId,
      messages: selectedMessages,
      setSelectedMessages: setSelectedMessages,
    });
  };

  const onInfoPress = async () => {
    const msg = await getMessage(chatId, selectedMessages[0]);
    console.log('Message status: ', msg?.messageStatus);
  };

  const clearSelected = () => {
    setReplyToMessage(undefined);
    setSelectedMessages([]);
  };

  //effect runs when screen is focused
  //retrieves name of connection
  //reads intial messages from messages storage.
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const localState: any = {};
        store.dispatch({
          type: 'ACTIVE_CHAT_CHANGED',
          payload: chatId,
        });
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
        debouncedPeriodicOperations();
        //set saved messages
        const resp = await readPaginatedMessages(chatId);
        const cleanedMessages = resp.messages.filter(
          item => !shouldNotRender(item.contentType),
        );
        setMessages(cleanedMessages);
        setCursor(resp.cursor);

        //Notifying that initial message load is complete.
        localState.messagesLoaded = true;
        updateChatState(localState);
      })();

      return () => {
        //On losing focus, call this
        store.dispatch({
          type: 'ACTIVE_CHAT_CHANGED',
          payload: undefined,
        });
      };
    }, [chatId, dataHandler, isGroupChat]),
  );

  const updateGroup = async () => {
    if (isGroupChat) {
      const groupHandler = new Group(chatId);
      updateChatState({groupInfo: await groupHandler.getData()});
    }
  };

  //runs every time a new message is recieved.
  useEffect(() => {
    if (
      chatState.messagesLoaded &&
      latestReceivedMessage &&
      latestReceivedMessage.chatId === chatId
    ) {
      if (!shouldNotRender(latestReceivedMessage.contentType)) {
        console.log('[CHAT UPDATE] - New message received');
        setMessages(oldList => [latestReceivedMessage].concat(oldList));
      } else {
        console.log('[CHAT DATA UPDATE] - dropping due to data message');
      }
    }
    updateGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestReceivedMessage]);

  //Runs every time a message is sent into the queue. Updates with the last message that was sent to it, instead of fetching from DB everytime
  useEffect(() => {
    if (
      latestSentMessage &&
      chatState.messagesLoaded &&
      latestSentMessage.chatId === chatId
    ) {
      if (!shouldNotRender(latestSentMessage.contentType)) {
        console.log('[CHAT UPDATE] - New message sent');
        setMessages(oldList => [latestSentMessage].concat(oldList));
      } else {
        console.log('[CHAT DATA UPDATE] - dropping sent message');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestSentMessage]);

  //Runs every time a sent message's send status is updated.
  useEffect(() => {
    if (
      chatState.messagesLoaded &&
      latestUpdatedSendStatus &&
      latestUpdatedSendStatus.chatId === chatId
    ) {
      console.log('[CHAT UPDATE] - Message status updated');
      setMessages(oldList => {
        if (oldList.length > 0) {
          const idx = oldList.findIndex(
            item => item.messageId === latestUpdatedSendStatus.messageId,
          );
          let msgs = [...oldList];
          msgs[idx] = {...msgs[idx], ...latestUpdatedSendStatus};
          return msgs;
        } else {
          return oldList;
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestUpdatedSendStatus]);

  //Runs every time a sent message's media status is updated. Updates with the data present inside latestUpdatedMediaStatus
  useEffect(() => {
    if (
      chatState.messagesLoaded &&
      latestUpdatedMediaStatus.data &&
      latestUpdatedMediaStatus.chatId === chatId
    ) {
      console.log('[CHAT UPDATE] - Media status updated');
      setMessages(oldList => {
        if (oldList.length > 0) {
          const idx = oldList.findIndex(
            item => item.messageId === latestUpdatedMediaStatus.messageId,
          );
          let msgs = [...oldList];
          msgs[idx].data = {
            ...msgs[idx].data,
            ...latestUpdatedMediaStatus.data,
          };
          return msgs;
        } else {
          return oldList;
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestUpdatedMediaStatus]);

  const onStartReached = async (): Promise<void> => {
    const resp = await readPaginatedMessages(chatId, cursor);
    const cleanedMessages = resp.messages.filter(
      item => !shouldNotRender(item.contentType),
    );
    setMessages(oldList => oldList.concat(cleanedMessages));
    //When this is called, the user has reached the top and a new message should autoscroll them down.

    setCursor(resp.cursor);
  };
  const onEndReached = async () => {
    console.log('Marking chat as read');
    await toggleRead(chatId);
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
        setReplyTo={setReplyToMessage}
        chatId={chatId}
        onStartReached={onStartReached}
        onEndReached={onEndReached}
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
              onInfo={onInfoPress}
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

/**
 * Determines if nothing should be rendered. Is defined here to prevent any bubble state initialisation.
 * @param contentType - message content type
 */
export function shouldNotRender(contentType: ContentType) {
  if (
    contentType === ContentType.handshakeA1 ||
    contentType === ContentType.handshakeB2 ||
    contentType === ContentType.newChat ||
    contentType === ContentType.displayImage ||
    contentType === ContentType.displayAvatar ||
    contentType === ContentType.contactBundleRequest ||
    contentType === ContentType.contactBundleDenialResponse ||
    contentType === ContentType.contactBundleResponse ||
    contentType === ContentType.initialInfoRequest ||
    contentType === ContentType.update
  ) {
    return true;
  } else {
    return false;
  }
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

export default memo(Chat, (prevProps, nextProps) => {
  return (
    prevProps.route.params.chatId === nextProps.route.params.chatId &&
    prevProps.route.params.isGroupChat === nextProps.route.params.isGroupChat &&
    prevProps.route.params.isConnected === nextProps.route.params.isConnected &&
    prevProps.route.params.profileUri === nextProps.route.params.profileUri
  );
});
