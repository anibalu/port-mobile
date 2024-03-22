import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {KeyboardAvoidingView, StyleSheet} from 'react-native';

import {DEFAULT_AVATAR, SELECTED_MESSAGES_LIMIT} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
import Clipboard from '@react-native-clipboard/clipboard';
//import store from '@store/appStore';
import {toggleRead} from '@utils/Connections';
import {
  ContentType,
  LinkParams,
  SavedMessageParams,
  TextParams,
} from '@utils/Messaging/interfaces';
import {getMessage} from '@utils/Storage/messages';

import store from '@store/appStore';
import {debouncedPeriodicOperations} from '@utils/AppOperations';
import DirectChat from '@utils/DirectChats/DirectChat';
import {useSelector} from 'react-redux';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {getLatestMessages} from '@utils/Storage/messages';
import {PortColors, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import RichReactionsBottomsheet from '@components/Reusable/BottomSheets/RichReactionsBottomsheet';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import ChatTopbar from '@screens/Chat/ChatTopbar';
import ChatList from './ChatList';
import {MessageActionsBar} from '@screens/Chat/MessageActionsBar';
import MessageBar from '@screens/Chat/MessageBar';
import {GestureSafeAreaView} from '@components/GestureSafeAreaView';
import ChatBackground from '@components/ChatBackground';
import Disconnected from '@screens/Chat/Disconnected';
import {AudioPlayerProvider} from 'src/context/AudioPlayerContext';

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
  const {chatId, isConnected, profileUri, name} = route.params;

  const [cursor, setCursor] = useState(50);

  const [chatState, setChatState] = useState({
    name: name ? name : '',
    profileURI: profileUri || DEFAULT_AVATAR,
    connectionConnected: isConnected,
    messagesLoaded: false,
  });

  const {copyingMessageError, messageCopied} = useErrorModal();

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
  //message to be replied to
  const [replyToMessage, setReplyToMessage] =
    useState<SavedMessageParams | null>(null);

  //re-render trigger
  const ping: any = useSelector(state => (state as any).ping.ping);

  //haptic feedback options
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
        const msg = await getMessage(chatId, message);
        if (msg) {
          switch (msg.contentType) {
            case ContentType.text: {
              //Formatting multiple messages into a single string.
              copyString += (msg.data as TextParams).text;
              setSelectedMessages([]);
              break;
            }
            case ContentType.link: {
              copyString += (msg.data as LinkParams).text;
              setSelectedMessages([]);
              break;
            }
            default:
              //throw new Error('Unsupported copy type');
              break;
          }
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

  const clearSelected = () => {
    setReplyToMessage(null);
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
        const dataHandler = new DirectChat(chatId);
        const chatData = await dataHandler.getChatData();
        localState.name = chatData.name;
        localState.profileURI = chatData.displayPic
          ? chatData.displayPic
          : DEFAULT_AVATAR;
        //set saved messages
        const resp = await getLatestMessages(chatId, cursor);
        setMessages(resp);
        //Notifying that initial message load is complete.
        localState.messagesLoaded = true;
        updateChatState(localState);
        await debouncedPeriodicOperations();
      })();

      return () => {
        //On losing focus, call this
        store.dispatch({
          type: 'ACTIVE_CHAT_CHANGED',
          payload: undefined,
        });
      };
      // eslint-disable-next-line
        }, []),
  );

  useEffect(() => {
    (async () => {
      console.log('[PINGING] ', ping);
      const resp = await getLatestMessages(chatId, cursor);
      setMessages(resp);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ping, cursor]);

  const onStartReached = async (): Promise<void> => {
    const initCursor = cursor;
    const resp = await getLatestMessages(chatId, initCursor + 50);
    setMessages(resp);
    console.log('setting cursor 2');
    setCursor(cursor + 50);
  };

  const onEndReached = async () => {
    console.log('Marking chat as read');
    await toggleRead(chatId);
  };

  const onSettingsPressed = async () => {
    const dataHandler = new DirectChat(chatId);
    const chatData = await dataHandler.getChatData();
    navigation.navigate('ContactProfile', {
      chatId: chatId,
      name: chatData.name,
      profileUri: chatData.displayPic || DEFAULT_AVATAR,
      permissionsId: chatData.permissionsId,
    });
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
      <GestureSafeAreaView style={styles.screen}>
        <ChatBackground />
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
            clearSelection={clearSelected}
            onStartReached={onStartReached}
            onEndReached={onEndReached}
            selectedMessages={selectedMessages}
            handlePress={handleMessageBubbleShortPress}
            handleLongPress={handleMessageBubbleLongPress}
            isGroupChat={false}
            setReaction={setRichReactionMessage}
            isConnected={chatState.connectionConnected}
          />
          {chatState.connectionConnected ? (
            <>
              {selectedMessages.length > 0 && !replyToMessage ? (
                <MessageActionsBar
                  chatId={chatId}
                  onCopy={onCopy}
                  isGroup={false}
                  onForward={onForward}
                  selectedMessages={selectedMessages}
                  setReplyTo={setReplyToMessage}
                  postDelete={updateAfterDeletion}
                />
              ) : (
                <MessageBar
                  onSend={clearSelected}
                  chatId={chatId}
                  replyTo={replyToMessage}
                  isGroupChat={false}
                />
              )}
            </>
          ) : selectedMessages.length > 0 && !replyToMessage ? (
            <MessageActionsBar
              isDisconnected={true}
              chatId={chatId}
              onCopy={onCopy}
              isGroup={false}
              onForward={onForward}
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
      </GestureSafeAreaView>
    </AudioPlayerProvider>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    width: screen.width,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  screen: {
    flexDirection: 'column',
    backgroundColor: PortColors.background,
  },
  background: {
    position: 'absolute',
    flex: 1,
  },
});

export default Chat;
