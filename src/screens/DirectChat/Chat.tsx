import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {AppState, KeyboardAvoidingView, StyleSheet, View} from 'react-native';

import {DEFAULT_AVATAR} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
//import store from '@store/appStore';
import {toggleRead} from '@utils/Connections';
import store from '@store/appStore';
import {debouncedPeriodicOperations} from '@utils/AppOperations';
import DirectChat from '@utils/DirectChats/DirectChat';
import {useSelector} from 'react-redux';
import {getLatestMessages} from '@utils/Storage/messages';
import {PortColors, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import RichReactionsBottomsheet from '@components/Reusable/BottomSheets/RichReactionsBottomsheet';
import ChatTopbar from '@screens/Chat/ChatTopbar';
import ChatList from './ChatList';
import {MessageActionsBar} from '@screens/Chat/MessageActionsBar';
import MessageBar from '@screens/Chat/MessageBar';
import {GestureSafeAreaView} from '@components/GestureSafeAreaView';
import ChatBackground from '@components/ChatBackground';
import Disconnected from '@screens/Chat/Disconnected';
import {AudioPlayerProvider} from 'src/context/AudioPlayerContext';
import {ChatContextProvider, useChatContext} from './ChatContext';
import BlurViewModal from '@components/Reusable/BlurView/BlurView';
import DualActionBottomSheet from '@components/Reusable/BottomSheets/DualActionBottomSheet';

type Props = NativeStackScreenProps<AppStackParamList, 'DirectChat'>;

/**
 * Renders a chat screen. The chatlist that is rendered is INVERTED, which means that any `top` function is a `bottom` function and vice versa.
 * @returns Component for rendered chat window
 */
function Chat({route}: Props) {
  const {chatId, isConnected, profileUri, name, isAuthenticated} = route.params;
  return (
    <ChatContextProvider
      chatId={chatId}
      connected={isConnected}
      avatar={profileUri}
      displayName={name}
      isGroupChat={false}
      authenticated={isAuthenticated}>
      <ChatScreen />
    </ChatContextProvider>
  );
}

function ChatScreen() {
  //chat screen context
  const {
    chatId,
    isConnected,
    setProfileUri,
    name,
    setName,
    setMessagesLoaded,
    currentReactionMessage,
    showRichReaction,
    unsetRichReaction,
    selectionMode,
    selectedMessage,
    messages,
    setMessages,
    showDeleteForEveryone,
    openDeleteMessageModal,
    setOpenDeleteMessageModal,
    performDelete,
    performGlobalDelete,
    setIsAuthenticated,
  } = useChatContext();

  //cursor for number of messages on screen
  const [cursor, setCursor] = useState(50);

  //re-render trigger
  const ping: any = useSelector(state => (state as any).ping.ping);

  //effect runs when screen is focused
  //retrieves name of connection
  //reads intial messages from messages storage.
  useFocusEffect(
    useCallback(() => {
      (async () => {
        store.dispatch({
          type: 'ACTIVE_CHAT_CHANGED',
          payload: chatId,
        });
        const dataHandler = new DirectChat(chatId);
        const chatData = await dataHandler.getChatData();
        setName(chatData.name);
        setProfileUri(
          chatData.displayPic ? chatData.displayPic : DEFAULT_AVATAR,
        );
        setIsAuthenticated(chatData.authenticated);
        //set saved messages
        const resp = await getLatestMessages(chatId, cursor);
        setMessages(resp);
        //Notifying that initial message load is complete.
        setMessagesLoaded(true);
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
      // Guard against being in the background state
      // This helps prevent read receipts from being sent when they shouldn't be
      if (AppState.currentState !== 'active') {
        console.log(
          '[PING] Skipping redraw on chat screen since app is not foregrounded',
        );
        return;
      }
      const dataHandler = new DirectChat(chatId);
      const chatData = await dataHandler.getChatData();
      setIsAuthenticated(chatData.authenticated);
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

  return (
    <AudioPlayerProvider>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <GestureSafeAreaView style={styles.screen}>
        <ChatBackground />
        <ChatTopbar />
        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : 'height'}
          keyboardVerticalOffset={isIOS ? 50 : 0}
          style={styles.main}>
          <ChatList
            messages={messages}
            onStartReached={onStartReached}
            onEndReached={onEndReached}
          />
          <DualActionBottomSheet
            showMore={showDeleteForEveryone}
            openModal={openDeleteMessageModal}
            title={'Delete message'}
            topButton={
              showDeleteForEveryone ? 'Delete for everyone' : 'Delete for me'
            }
            topButtonFunction={
              showDeleteForEveryone ? performGlobalDelete : performDelete
            }
            middleButton="Delete for me"
            middleButtonFunction={performDelete}
            onClose={() => {
              setOpenDeleteMessageModal(false);
            }}
          />
          {isConnected ? (
            <>{selectionMode ? <MessageActionsBar /> : <MessageBar />}</>
          ) : selectionMode ? (
            <MessageActionsBar />
          ) : (
            <View style={{paddingTop: 60}}>
              <Disconnected name={name} />
            </View>
          )}
        </KeyboardAvoidingView>
        <RichReactionsBottomsheet
          chatId={chatId}
          currentReactionMessage={currentReactionMessage}
          onClose={unsetRichReaction}
          visible={showRichReaction}
        />
      </GestureSafeAreaView>
      {selectedMessage && <BlurViewModal />}
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
