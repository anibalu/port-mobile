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
import Group from '@utils/Groups/GroupClass';
import {getLatestGroupMessages} from '@utils/Storage/groupMessages';
import {MessageActionsBar} from '@components/GroupChatComponents/MessageActionsBar';
import MessageBar from '@components/GroupChatComponents/MessageBar';
import Disconnected from '@components/GroupChatComponents/Disconnected';
import ChatTopbar from '@components/GroupChatComponents/ChatTopbar';
import GroupBlurViewModal from '@components/Reusable/BlurView/GroupBlurView';
import DualActionBottomSheet from '@components/Reusable/BottomSheets/DualActionBottomSheet';
import {messageReportCategories} from '@configs/reportingCategories';
import GroupReportMessageBottomSheet from '@components/Reusable/BottomSheets/GroupReportMessageBottomSheet';

type Props = NativeStackScreenProps<AppStackParamList, 'GroupChat'>;

interface ReportingTypes {
  index: number;
  title: string;
}
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
    showReportModal,
    setShowReportModal,
    openDeleteMessageModal,
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
    setIsConnected,
    setGroupClass,
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

  const [onReportSubmitted, setReportSubmitted] = useState(false);
  const [selectedReportOption, setSelectedReportOption] =
    useState<ReportingTypes>(messageReportCategories[0]);
  const [otherReport, setOtherReport] = useState('');
  //cursor for number of messages on screen
  const [cursor, setCursor] = useState(50);
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
        //set saved messages
        const resp = await getLatestGroupMessages(chatId, cursor);
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
        const resp = await getLatestGroupMessages(chatId, cursor);
        setMessages(resp);
      } catch (error) {
        console.log('Error fetching chat data: ', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ping, newMessageTrigger, cursor]);

  const onStartReached = async (): Promise<void> => {
    const initCursor = cursor;
    const resp = await getLatestGroupMessages(chatId, initCursor + 50);
    setMessages(resp);
    console.log('setting cursor 2');
    setCursor(cursor + 50);
  };

  const onEndReached = async () => {
    console.log('Marking chat as read');
    await toggleRead(chatId);
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
        <GroupReportMessageBottomSheet
          description="Your report is anonymous. The reported user will not be notified of the report."
          openModal={showReportModal}
          topButton={'Report'}
          setReportSubmitted={setReportSubmitted}
          setSelectedReportOption={setSelectedReportOption}
          selectedReportOption={selectedReportOption}
          otherReport={otherReport}
          setOtherReport={setOtherReport}
          onClose={() => {
            setShowReportModal(false);
          }}
          onReportSubmitted={onReportSubmitted}
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
