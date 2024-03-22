import {SafeAreaView} from '@components/SafeAreaView';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {KeyboardAvoidingView, StyleSheet} from 'react-native';

import {DEFAULT_AVATAR, SELECTED_MESSAGES_LIMIT} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
import Clipboard from '@react-native-clipboard/clipboard';
//import store from '@store/appStore';
import {toggleRead} from '@utils/Connections';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {
  getGroupMessage,
  getMessage,
  readPaginatedGroupMessages,
} from '@utils/Storage/messages';

import store from '@store/appStore';
import {debouncedPeriodicOperations} from '@utils/AppOperations';
import DirectChat from '@utils/DirectChats/DirectChat';
import Group from '@utils/Groups/Group';
import {handleAsyncMediaDownload as directMedia} from '@utils/Messaging/Receive/ReceiveDirect/HandleMediaDownload';
import {handleAsyncMediaDownload as groupMedia} from '@utils/Messaging/Receive/ReceiveGroup/HandleMediaDownload';
import {getLatestMessages} from '@utils/Storage/messages';
import {useSelector} from 'react-redux';
import {useErrorModal} from 'src/context/ErrorModalContext';
import ChatList from './ChatList';
import ChatTopbar from './ChatTopbar';
import {MessageActionsBar} from './MessageActionsBar';
import MessageBar from './MessageBar';

import {PortColors, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import RichReactionsBottomsheet from '@components/Reusable/BottomSheets/RichReactionsBottomsheet';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {AudioPlayerProvider} from 'src/context/AudioPlayerContext';
import Disconnected from './Disconnected';

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
  const {chatId, isGroupChat, isConnected, profileUri, name} = route.params;

  //Datahandler contains functions about the group, if it is a group, else the DM.
  const dataHandler = useMemo(() => {
    return isGroupChat ? new Group(chatId) : new DirectChat(chatId);
  }, [isGroupChat, chatId]);

  const [cursor, setCursor] = useState(50);

  const [chatState, setChatState] = useState({
    name: name ? name : '',
    groupInfo: {},
    profileURI: profileUri || DEFAULT_AVATAR,
    connectionConnected: isConnected,
    messagesLoaded: false,
  });

  const {copyingMessageError, messageCopied, mediaDownloadError} =
    useErrorModal();

  const [messages, setMessages] = useState<SavedMessageParams[]>([]);
  const [currentReactionMessage, setCurrentReactionMessage] = useState<
    string[]
  >([]);
  const [showRichReaction, setShowRichReaction] = useState<boolean>(false);

  const setRichReactionMessage = (chatId: string, messageId: string) => {
    setCurrentReactionMessage([chatId, messageId]);
    setShowRichReaction(true);
  };

  const unsetRichReaction = () => {
    setCurrentReactionMessage([]);
    setShowRichReaction(false);
  };

  //selected messages
  const [selectedMessages, setSelectedMessages] = useState<Array<string>>([]);
  //message to be replied
  const [replyToMessage, setReplyToMessage] = useState<SavedMessageParams>();

  const ping: any = useSelector(state => state.ping.ping);
  const options = {
    enableVibrateFallback: true /* iOS Only */,
    ignoreAndroidSystemSettings: true /* Android Only */,
  };
  //handles toggling the select messages flow.
  const handleMessageBubbleLongPress = (messageId: string): void => {
    //adds messageId to selected messages on long press and vibrates
    ReactNativeHapticFeedback.trigger('impactMedium', options);
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
    // setMessages(messages =>
    //   messages.filter(message => !messageIds.includes(message.messageId)),
    // );
    const newMessages = messages.map(x => {
      if (messageIds.includes(x.messageId)) {
        x.contentType = ContentType.deleted;
        x.mtime = 'RESET';
      }
      return x;
    });
    setMessages(newMessages);
    setSelectedMessages([]);
  };

  const onCopy = async () => {
    let copyString = '';
    try {
      for (const message of selectedMessages) {
        const msg = isGroupChat
          ? await getGroupMessage(chatId, message)
          : await getMessage(chatId, message);
        switch (msg?.contentType) {
          case ContentType.text: {
            //Formatting multiple messages into a single string.
            copyString += msg?.data.text;
            setSelectedMessages([]);
            break;
          }
          case ContentType.link: {
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
      messageCopied();
    } catch (error) {
      console.log('Error copying messages', error);
    }
  };

  const onForward = () => {
    navigation.navigate('ForwardToContact', {
      chatId: chatId,
      messages: selectedMessages,
    });
  };

  //TODO implement something
  const onInfoPress = async () => {
    const msg = isGroupChat
      ? await getGroupMessage(chatId, selectedMessages[0])
      : await getMessage(chatId, selectedMessages[0]);
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
        const resp = isGroupChat
          ? (await readPaginatedGroupMessages(chatId)).messages
          : await getLatestMessages(chatId, cursor);
        const cleanedMessages = resp.filter(
          item => !shouldNotRender(item.contentType),
        );
        setMessages(cleanedMessages);
        console.log('setting cursor 1');
        setCursor(cursor);
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
      // eslint-disable-next-line
    }, [chatId, dataHandler, isGroupChat]),
  );

  useEffect(() => {
    (async () => {
      console.log('[PINGING] ', ping);
      const resp = isGroupChat
        ? (await readPaginatedGroupMessages(chatId)).messages
        : await getLatestMessages(chatId, cursor);
      const cleanedMessages = resp.filter(
        item => !shouldNotRender(item.contentType),
      );
      setMessages(cleanedMessages);
      updateGroup();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ping, cursor]);

  const updateGroup = async () => {
    if (isGroupChat) {
      const groupHandler = new Group(chatId);
      updateChatState({groupInfo: await groupHandler.getData()});
    }
  };

  const onStartReached = async (): Promise<void> => {
    const initCursor = cursor;
    const resp = isGroupChat
      ? (await readPaginatedGroupMessages(chatId, cursor)).messages
      : await getLatestMessages(chatId, initCursor + 50);
    const cleanedMessages = resp.filter(
      item => !shouldNotRender(item.contentType),
    );
    setMessages(cleanedMessages);
    console.log('setting cursor 2');
    setCursor(cursor + 50);
  };
  const onEndReached = async () => {
    console.log('Marking chat as read');
    await toggleRead(chatId);
  };

  const onSettingsPressed = async () => {
    if (isGroupChat) {
      navigation.navigate('GroupProfile', {groupId: chatId});
    } else {
      const chatData = await (dataHandler as DirectChat).getChatData();
      navigation.navigate('ContactProfile', {
        chatId: chatId,
        name: chatData.name,
        profileUri: chatData.displayPic || DEFAULT_AVATAR,
        permissionsId: chatData.permissionsId,
      });
    }
  };

  const handleDownload = async (messageId: string) => {
    try {
      if (isGroupChat) {
        await groupMedia(chatId, messageId);
      } else {
        await directMedia(chatId, messageId);
      }
      store.dispatch({
        type: 'PING',
        payload: 'PONG',
      });
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

  return (
    <AudioPlayerProvider>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView style={styles.screen}>
        <ChatTopbar
          name={chatState.name}
          profileURI={chatState.profileURI}
          selectedMessagesLength={selectedMessages.length}
          onSettingsPressed={onSettingsPressed}
          onBackPress={onBackPress}
          onCancelPressed={onCancelPressed}
        />
        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : 'height'}
          keyboardVerticalOffset={isIOS ? 50 : 0}
          style={styles.main}>
          <ChatList
            messages={messages}
            setReplyTo={setReplyToMessage}
            chatId={chatId}
            onPostSelect={clearSelected}
            onStartReached={onStartReached}
            onEndReached={onEndReached}
            selectedMessages={selectedMessages}
            handlePress={handleMessageBubbleShortPress}
            handleLongPress={handleMessageBubbleLongPress}
            handleDownload={handleDownload}
            isGroupChat={isGroupChat}
            dataHandler={dataHandler}
            setReaction={setRichReactionMessage}
            isConnected={isConnected}
          />

          {chatState.connectionConnected ? (
            <>
              {selectedMessages.length > 0 && replyToMessage === undefined ? (
                <MessageActionsBar
                  chatId={chatId}
                  onCopy={onCopy}
                  isGroup={isGroupChat}
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
          ) : selectedMessages.length > 0 && replyToMessage === undefined ? (
            <MessageActionsBar
              isDisconnected={true}
              chatId={chatId}
              onCopy={onCopy}
              isGroup={isGroupChat}
              onForward={onForward}
              onInfo={onInfoPress}
              selectedMessages={selectedMessages}
              setReplyTo={setReplyToMessage}
              postDelete={updateAfterDeletion}
            />
          ) : (
            <Disconnected name={chatState.name} />
          )}
        </KeyboardAvoidingView>
        <RichReactionsBottomsheet
          chatId={chatId}
          currentReactionMessage={currentReactionMessage}
          onClose={unsetRichReaction}
          visible={showRichReaction}
        />
      </SafeAreaView>
    </AudioPlayerProvider>
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
    contentType === ContentType.reaction ||
    contentType === ContentType.name
  ) {
    return true;
  } else {
    return false;
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    height: screen.height,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  screen: {
    flexDirection: 'column',
    backgroundColor: PortColors.background,
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
