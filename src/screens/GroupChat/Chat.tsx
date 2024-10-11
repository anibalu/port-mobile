import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {
  AppState,
  BackHandler,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {DEFAULT_AVATAR} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
//import store from '@store/appStore';
import {toggleRead} from '@utils/Storage/connections';
import store from '@store/appStore';
import {debouncedPeriodicOperations} from '@utils/AppOperations';
import {isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import RichGroupReactionsBottomsheet from '@components/Reusable/BottomSheets/RichGroupReactionsBottomsheet';
import ChatList from './ChatList';
import {GestureSafeAreaView} from '@components/GestureSafeAreaView';
import {AudioPlayerProvider} from 'src/context/AudioPlayerContext';
import {ChatContextProvider, useChatContext} from './ChatContext';
// import DualActionBottomSheet from '@components/Reusable/BottomSheets/DualActionBottomSheet';
// import ReportMessageBottomSheet from '@components/Reusable/BottomSheets/ReportMessageBottomSheet';
import DynamicColors from '@components/DynamicColors';
import {TemplateParams} from '@utils/Storage/DBCalls/templates';
import {DisplayableContentTypes} from '@utils/Messaging/interfaces';
import {useTheme} from 'src/context/ThemeContext';
import {runOnJS, useAnimatedReaction} from 'react-native-reanimated';
import {useListenForTrigger} from '@utils/TriggerTools/RedrawTriggerListener/useListenForTrigger';
import {TRIGGER_TYPES} from '@store/triggerRedraw';
import {useSelector} from 'react-redux';
import {
  getLatestGroupMessages,
  getGroupMessagesAfterMessageId,
  getGroupMessagesBeforeMessageId,
} from '@utils/Storage/groupMessages';
import Group from '@utils/Groups/GroupClass';
import {MessageActionsBar} from '@components/GroupChatComponents/MessageActionsBar';
import MessageBar from '@components/GroupChatComponents/MessageBar';
import Disconnected from '@components/GroupChatComponents/Disconnected';
import ChatTopbar from '@components/GroupChatComponents/ChatTopbar';
import GroupBlurViewModal from '@components/Reusable/BlurView/GroupBlurView';
import DualActionBottomSheet from '@components/Reusable/BottomSheets/DualActionBottomSheet';

type Props = NativeStackScreenProps<AppStackParamList, 'GroupChat'>;

/**
 * Renders a chat screen. The chatlist that is rendered is INVERTED, which means that any `top` function is a `bottom` function and vice versa.
 * @returns Component for rendered chat window
 */
function Chat({route}: Props) {
  const {
    chatId,
    isConnected,
    profileUri,
    name,
    ifTemplateExists = undefined, // if template is selected from templates screen
  } = route.params;
  return (
    <ChatContextProvider
      chatId={chatId}
      connected={isConnected}
      avatar={profileUri}
      displayName={name}
      isGroupChat={true}>
      <ChatScreen ifTemplateExists={ifTemplateExists} />
    </ChatContextProvider>
  );
}

function ChatScreen({ifTemplateExists}: {ifTemplateExists?: TemplateParams}) {
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
    // showReportModal,
    // setShowReportModal,
    openDeleteMessageModal,
    scrollToBottomClicked,
    setScrollToBottomClicked,
    setOpenDeleteMessageModal,
    performDelete,
    performGlobalDelete,
    isPopUpVisible,
    togglePopUp,
    isEmojiSelectorVisible,
    setIsEmojiSelectorVisible,
    setPermissions,
    setPermissionsId,
    isScreenClickable,
    moveSliderIntermediateOpen,
    listWindowMode,
    setListWindowMode,
    setIsConnected,
    setUnseenMessagesCount,
    setGroupClass,
    setScrollToLatestMessage,
  } = useChatContext();

  const [pointerEvents, setPointerEvents] = useState<
    'auto' | 'none' | 'box-none' | 'box-only'
  >('auto');
  useAnimatedReaction(
    () => isScreenClickable.value,
    value => {
      runOnJS(setPointerEvents)(value ? 'auto' : 'box-only');
    },
  );

  //initial cursor state values
  const initialCursor = 25;
  const initialCursorUp = 50;
  const initialCursorDown = 50;

  //cursor is for number of messages on screen
  const [cursor, setCursor] = useState(initialCursor); // main cursor for scrolling only in up direction in normal mode
  const [cursorUp, setCursorUp] = useState<number>(initialCursorUp); // cursor for scrolling up in window mode
  const [cursorDown, setCursorDown] = useState<number>(initialCursorDown); // cursor for scrolling down in window mode

  const navigation = useNavigation();

  //re-render trigger
  const newMessageTrigger = useListenForTrigger(TRIGGER_TYPES.NEW_MESSAGE);
  //pings need to be deprecated in favor of new trigger system.
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
        try {
          const dataHandler = await Group.load(chatId);
          setGroupClass(dataHandler);
          const chatData = dataHandler.getGroupData();
          setIsConnected(!chatData.disconnected);
          setPermissionsId(chatData.permissionsId);
          setName(chatData.name);
          setProfileUri(
            chatData.groupPicture ? chatData.groupPicture : DEFAULT_AVATAR,
          );
          setPermissions(await dataHandler.getPermissions());
        } catch (error) {
          console.error('No such chat or no available group members: ', error);
        }
        // Prevent duplicate fetch
        if (!messages || messages.length === 0) {
          //set saved messages
          const resp = await getLatestGroupMessages(chatId, cursor);
          setMessages(resp);
        }
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

  const [fetchLatestTrigger, setFetchLatestTrigger] = useState(false);
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);

  useEffect(() => {
    setFetchLatestTrigger(true);
  }, [ping, newMessageTrigger]);

  useEffect(() => {
    (async () => {
      // Guard against being in the background state
      // This helps prevent read receipts from being sent when they shouldn't be
      if (AppState.currentState !== 'active') {
        console.log(
          '[PING] Skipping redraw on chat screen since app is not foregrounded',
        );
        return;
      }
      try {
        const dataHandler = await Group.load(chatId);
        setGroupClass(dataHandler);
        const chatData = dataHandler.getGroupData();
        setIsConnected(!chatData.disconnected);
        setName(chatData.name);
        setProfileUri(
          chatData.groupPicture ? chatData.groupPicture : DEFAULT_AVATAR,
        );

        // Prevent duplicate fetch
        if (!messages || messages.length === 0 || fetchLatestTrigger) {
          const resp = await getLatestGroupMessages(chatId, cursor);

          if (latestMessageId) {
            // Find the index of the message with latestMessageId in the fetched messages
            const latestMessageIndex = resp.findIndex(
              message => message.messageId === latestMessageId,
            );

            // If the latestMessageId is found in the list
            if (latestMessageIndex !== -1) {
              // Get all messages before the latestMessageId and filter by sender === false (i.e. unread messages)
              const unreadMessages = resp
                .slice(0, latestMessageIndex) // Slice the array to get messages before the found message
                .filter(message => message.sender === false); // Filter messages where sender is false (unread)

              // Calculate the unread message count based on the filtered array
              const unseenMessagesCount = unreadMessages.length;

              // Set the unseenMessagesCount state to trigger UI updates, like showing a badge
              setUnseenMessagesCount(unseenMessagesCount);
              setFetchLatestTrigger(false);
            } else {
              console.log(
                'Latest message ID not found in the fetched messages.',
              );
            }

            // Optionally, set a new messageId for future reference or testing purposes
            setLatestMessageId(resp[0].messageId); // Set a new latest message ID
          } else {
            // If latestMessageId is not provided, set a default messageId
            setLatestMessageId(resp[0].messageId); // Set a new latest message ID
          }

          if (resp[0].messageId !== messages[0].messageId) {
            setMessages(resp);
          }
        }
      } catch (error) {
        console.log('Error fetching chat data: ', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ping, newMessageTrigger, cursor, fetchLatestTrigger]);

  // runs when you hit start point of chat flatlist
  const onStartReached = async (): Promise<void> => {
    if (!listWindowMode) {
      const resp = await getLatestGroupMessages(chatId, cursor + 25);
      setMessages(resp);

      //if we fetch last message set which is less than set of expected 25
      if (resp.length < messages.length + 25) {
        setCursor(resp.length);
      } else {
        setCursor(cursor + 25);
      }
    } else {
      const resp = await getGroupMessagesBeforeMessageId(
        chatId,
        messages[0].messageId,
        cursorUp + 25,
      );
      setMessages(resp);

      //if we fetch last message set which is less than set of expected 25
      if (resp.length < messages.length + 25) {
        setCursorUp(resp.length);
        setCursorDown(resp.length);
      } else {
        setCursorUp(cursorUp + 25);
        setCursorDown(cursorDown + 25);
      }
    }
  };

  // runs when you hit end point of chat flatlist
  const onEndReached = async () => {
    if (!listWindowMode) {
      console.log('Marking chat as read');
      console.log('reseting all cursors');
      setUnseenMessagesCount(0);
      setCursor(25);
      if (scrollToBottomClicked) {
        setFetchLatestTrigger(true);
        setScrollToLatestMessage(true);
        setScrollToBottomClicked(false);
      }
      setCursorDown(initialCursorDown);
      setCursorUp(initialCursorUp);
      await toggleRead(chatId);
    } else {
      const resp = await getGroupMessagesAfterMessageId(
        chatId,
        messages[messages.length - 1].messageId,
        cursorDown + 25,
      );

      // Append only the new messages
      setMessages(resp);

      // if we reach end of the list, i.e. no more messages to fetch
      if (resp.length < messages.length + 25) {
        // then Update cursorDown and cursorUp to fetched messages value if the response length is less than what was supposed to be fetched
        setCursorUp(cursorUp + resp.length);
        setCursorDown(cursorDown + resp.length);
        setListWindowMode(false);
      } else {
        // then Update cursorDown and cursorUp to current messages array value
        setCursorUp(cursorUp + 25);
        setCursorDown(cursorDown + 25);
      }
    }
  };

  useEffect(() => {
    const backAction = async () => {
      await toggleRead(chatId);
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Colors = DynamicColors();
  const styles = styling();
  const {themeValue} = useTheme();

  const onChatScreenPressed = () => {
    //If slider is open, close it.
    if (!isScreenClickable.value) {
      moveSliderIntermediateOpen();
    }
    // if pop up actions is visible
    // close component
    if (isPopUpVisible) {
      togglePopUp();
    }
    // if emoji keyboard is visible
    // close component
    if (isEmojiSelectorVisible) {
      setIsEmojiSelectorVisible(p => !p);
    }
  };

  return (
    <AudioPlayerProvider>
      <CustomStatusBar
        backgroundColor={
          themeValue === 'dark'
            ? Colors.primary.surface
            : Colors.primary.surface2
        }
      />
      <GestureSafeAreaView
        style={StyleSheet.compose(styles.screen, {
          backgroundColor:
            themeValue === 'dark'
              ? Colors.primary.background
              : Colors.primary.surface,
        })}>
        <KeyboardAvoidingView
          style={styles.main}
          behavior={isIOS ? 'padding' : 'height'}
          keyboardVerticalOffset={isIOS ? 50 : 0}>
          <Pressable
            style={styles.main}
            onPress={onChatScreenPressed}
            pointerEvents={pointerEvents}>
            <ChatList
              messages={messages.filter(x =>
                DisplayableContentTypes.includes(x.contentType),
              )}
              onStartReached={onStartReached}
              onEndReached={onEndReached}
            />
          </Pressable>
          <Pressable
            pointerEvents={pointerEvents}
            onPress={() => {
              if (!isScreenClickable.value) {
                moveSliderIntermediateOpen();
              }
            }}>
            {isConnected ? (
              <>
                {selectionMode ? (
                  <MessageActionsBar />
                ) : (
                  <MessageBar ifTemplateExists={ifTemplateExists} />
                )}
              </>
            ) : selectionMode ? (
              <MessageActionsBar />
            ) : (
              <View style={{paddingTop: 60}}>
                <Disconnected name={name} />
              </View>
            )}
          </Pressable>
        </KeyboardAvoidingView>
        <ChatTopbar />
        {/* <ReportMessageBottomSheet
          description="If you report this message, an unencrypted copy of this message is sent to our servers."
          openModal={showReportModal}
          topButton={'Report and Disconnect'}
          middleButton={'Report'}
          onClose={() => {
            setShowReportModal(false);
          }}
        />*/}
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
        <RichGroupReactionsBottomsheet
          chatId={chatId}
          currentReactionMessage={currentReactionMessage}
          onClose={unsetRichReaction}
          visible={showRichReaction}
        />
      </GestureSafeAreaView>
      {selectedMessage && <GroupBlurViewModal />}
    </AudioPlayerProvider>
  );
}

const styling = () =>
  StyleSheet.create({
    main: {
      flex: 1,
      width: screen.width,
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    screen: {
      flexDirection: 'column',
    },
    background: {
      position: 'absolute',
      flex: 1,
    },
  });

export default Chat;
