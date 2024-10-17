import {SELECTED_MESSAGES_LIMIT} from '@configs/constants';
import {
  ContentType,
  LargeDataParams,
  LinkParams,
  TextParams,
} from '@utils/Messaging/interfaces';
import React, {createContext, useState, useContext, useMemo} from 'react';
import {useErrorModal} from 'src/context/ErrorModalContext';
import Clipboard from '@react-native-clipboard/clipboard';
import {getRichReactions} from '@utils/Storage/reactions';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {useNavigation} from '@react-navigation/native';
import {GroupPermissions} from '@utils/Storage/DBCalls/permissions/interfaces';
import {screen} from '@components/ComponentUtils';
import {SharedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import {LoadedGroupMessage} from '@utils/Storage/DBCalls/groupMessage';
import {
  cleanDeleteGroupMessage,
  getGroupMessage,
  getLoadedGroupMessage,
} from '@utils/Storage/groupMessages';
import Group from '@utils/Groups/GroupClass';

/**
 * Access slider constants
 */
export const TOP_BAR_HEIGHT = 56; //height of chat screen top bar
export const PERMISSION_BAR_HEIGHT =
  Math.floor((screen.width - 32) / (20 + 12)) > 5 ? 52 : 88; //height of perission icons bar
export const SLIDER_HEIGHT = 32; //height of slider drag sliver
export const SLIDER_EXCESS_HEIGHT = 20; //height of slider minus height of notch
export const PERMISSIONS_OPEN_HEIGHT = 400; //height of permission cards
export const THRESHOLD_OPEN = 10; //distance to move to initiate full open motion
export const THRESHOLD_CLOSE = 10; //distance to move to initiate full close motion
export const SLIDER_CLOSED_HEIGHT = SLIDER_HEIGHT + TOP_BAR_HEIGHT; //height of slider when it is fully closed.
export const ICON_DISPLAY_HEIGHT =
  PERMISSION_BAR_HEIGHT + SLIDER_HEIGHT + TOP_BAR_HEIGHT; //height of slider when permission icons are displayed
export const MAX_SLIDER_HEIGHT =
  PERMISSIONS_OPEN_HEIGHT +
  SLIDER_HEIGHT +
  TOP_BAR_HEIGHT -
  SLIDER_EXCESS_HEIGHT; //height of slider when permission cards are displayed

export interface SelectedMessageType {
  pageY: number;
  height: number;
  message: LoadedGroupMessage;
}

type ChatContextType = {
  //basic chat params
  chatId: string;
  groupClass: Group | null;
  setGroupClass: (x: Group | null) => void;
  isGroupChat: boolean;
  isConnected: boolean;
  setIsConnected: (x: boolean) => void;
  profileUri: string | undefined | null;
  setProfileUri: (x: string | undefined | null) => void;
  permissions: GroupPermissions | null | undefined;
  setPermissions: (x: GroupPermissions | null | undefined) => void;
  permissionsId: string | null | undefined;
  setPermissionsId: (x: string | null | undefined) => void;
  name: string;
  setName: (x: string) => void;
  messagesLoaded: boolean;
  setMessagesLoaded: (x: boolean) => void;
  text: string;
  setText: (x: string) => void;
  //access slider attributes
  hasStarted: SharedValue<boolean>;
  isScreenClickable: SharedValue<boolean>;
  movingDown: SharedValue<boolean>;
  sliderHeightInitiaValue: SharedValue<number>;
  sliderHeight: SharedValue<number>;
  permissionCardHeight: SharedValue<number>;
  permissionIconHeight: SharedValue<number>;
  moveSliderCompleteClosed: () => void;
  moveSliderIntermediateOpen: () => void;
  moveSliderCompleteOpen: () => void;

  performGlobalDelete: () => void;
  performDelete: () => void;
  openDeleteMessageModal: boolean;
  setOpenDeleteMessageModal: (x: boolean) => void;
  showDeleteForEveryone: boolean;
  setShowDeleteForEveryone: (x: boolean) => void;
  reportedMessages: string[] | null;
  setReportedMessages: (x: any) => void;
  determineDeleteModalDisplay: () => void;
  //reactions context
  currentReactionMessage: string[];
  setCurrentReactionMessage: (x: string[]) => void;
  showRichReaction: boolean;
  setShowRichReaction: (x: boolean) => void;
  setReaction: (messageId: string) => void;
  unsetRichReaction: () => void;
  onReaction: (message: LoadedGroupMessage, reaction: string) => void;

  //message to be replied to
  replyToMessage: LoadedGroupMessage | null;
  setReplyToMessage: (x: LoadedGroupMessage | null) => void;

  // message to be edited
  setMessageToEdit: (x: SelectedMessageType | null) => void;
  messageToEdit: SelectedMessageType | null;

  //selected messages
  selectedMessages: string[];
  setSelectedMessages: (x: string[]) => void;

  //selected message
  selectedMessage: SelectedMessageType | null;
  setSelectedMessage: (x: SelectedMessageType | null) => void;

  //whether the chat screen is in selection mode
  selectionMode: boolean;
  setSelectionMode: (x: boolean) => void;

  //message bubble press
  handlePress: (
    messageId: string,
    contentType: ContentType,
  ) => boolean | undefined;
  handleLongPress: (messageId: string) => void;

  //message actions
  onCopy: () => Promise<void>;
  onForward: () => void;
  clearSelection: () => void;
  clearEverything: () => void;
  onEditMessage: () => void;

  //controls the visibility of a focused message bubble
  onCloseFocus: () => void;
  onCleanCloseFocus: () => void;
  onSelect: () => void;
  onDelete: () => void;
  onReport: () => void;
  showReportModal: boolean;
  setShowReportModal: (isShown: boolean) => void;
  onReply: () => Promise<void>;
  messages: LoadedGroupMessage[];
  setMessages: (message: LoadedGroupMessage[]) => void;
  updateAfterDeletion: (messageId: string[]) => void;
  updateAfterGlobalDeletion: (messageId: string[]) => void;
  isPopUpVisible: boolean;
  togglePopUp: () => void;
  setIsEmojiSelectorVisible: (p: boolean) => void;
  isEmojiSelectorVisible: boolean;
};

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined,
);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useFocusModal must be used within a ModalProvider');
  }
  return context;
};

export const ChatContextProvider = ({
  chatId,
  isGroupChat,
  connected,
  avatar,
  displayName,
  children,
}: {
  chatId: string;
  isGroupChat: boolean;
  connected: boolean;
  avatar: string | undefined | null;
  displayName: string | undefined;
  children: any;
}) => {
  const navigation = useNavigation();
  const {copyingMessageError, messageCopied, MessageAlreadyReportedError} =
    useErrorModal();

  const [isConnected, setIsConnected] = useState(connected);
  const [reportedMessages, setReportedMessages] = useState<string[] | null>(
    null,
  );
  const [groupClass, setGroupClass] = useState<Group | null>(null);
  const [permissions, setPermissions] = useState<
    GroupPermissions | null | undefined
  >(null);
  const [permissionsId, setPermissionsId] = useState<string | null | undefined>(
    null,
  );
  const [profileUri, setProfileUri] = useState(avatar);
  const [name, setName] = useState<string>(displayName || '');
  const [messagesLoaded, setMessagesLoaded] = useState(false);

  const [messages, setMessages] = useState<LoadedGroupMessage[]>([]);
  //responsible for opening deletion modal
  const [openDeleteMessageModal, setOpenDeleteMessageModal] = useState(false);
  //if delete for everyone should be available
  const [showDeleteForEveryone, setShowDeleteForEveryone] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [messageToEdit, setMessageToEdit] =
    useState<SelectedMessageType | null>(null);
  // sets text in text input
  const [text, setText] = useState('');

  //access slider attributes
  const hasStarted = useSharedValue(false);
  const isScreenClickable = useSharedValue(true);
  const sliderHeightInitiaValue = useSharedValue(
    TOP_BAR_HEIGHT + SLIDER_HEIGHT - SLIDER_EXCESS_HEIGHT,
  );
  const sliderHeight = useSharedValue(
    TOP_BAR_HEIGHT + SLIDER_HEIGHT - SLIDER_EXCESS_HEIGHT,
  );
  const permissionCardHeight = useSharedValue(0);
  const permissionIconHeight = useSharedValue(0);
  const movingDown = useSharedValue(false);
  //close slider completely
  const moveSliderCompleteClosed = () => {
    'worklet';
    isScreenClickable.value = true;
    sliderHeight.value = withTiming(SLIDER_CLOSED_HEIGHT, {
      duration: 500,
    });
    sliderHeightInitiaValue.value = SLIDER_CLOSED_HEIGHT;
    permissionIconHeight.value = withTiming(-SLIDER_EXCESS_HEIGHT, {
      duration: 300,
    });
    permissionCardHeight.value = withTiming(0, {duration: 500});
  };
  //open slider till permission icons visible
  const moveSliderIntermediateOpen = () => {
    'worklet';
    isScreenClickable.value = true;
    sliderHeight.value = withTiming(
      ICON_DISPLAY_HEIGHT - SLIDER_EXCESS_HEIGHT,
      {duration: 500},
    );
    sliderHeightInitiaValue.value = ICON_DISPLAY_HEIGHT - SLIDER_EXCESS_HEIGHT;
    permissionCardHeight.value = withTiming(0, {duration: 500});
    permissionIconHeight.value = withTiming(0, {duration: 300});
  };
  //open slider completely
  const moveSliderCompleteOpen = () => {
    'worklet';
    isScreenClickable.value = false;
    sliderHeight.value = withTiming(MAX_SLIDER_HEIGHT, {duration: 500});
    sliderHeightInitiaValue.value = MAX_SLIDER_HEIGHT;
    permissionCardHeight.value = withTiming(
      PERMISSION_BAR_HEIGHT + SLIDER_EXCESS_HEIGHT,
      {
        duration: 500,
      },
    );
    permissionIconHeight.value = withTiming(0, {duration: 300});
  };

  // for toggling emoji keyboard
  const [isEmojiSelectorVisible, setIsEmojiSelectorVisible] =
    useState<boolean>(false);

  // for toggling pop up actions
  const [isPopUpVisible, setPopUpVisible] = useState(false);

  // to toggle between whether popupbar is shown or not
  const togglePopUp = (): void => {
    setPopUpVisible(!isPopUpVisible);
  };
  const determineDeleteModalDisplay = async () => {
    let senderExists = true;
    const isDeleted =
      selectedMessage?.message.contentType === ContentType.deleted;
    for (const msg of selectedMessages) {
      const message = await getGroupMessage(chatId, msg);
      if (message && !message.sender) {
        senderExists = false;
        break;
      }
    }
    let showGlobalDelete = isDeleted ? !isDeleted : senderExists;
    setShowDeleteForEveryone(showGlobalDelete);
    setOpenDeleteMessageModal(true);
    return senderExists; // Return whether to show delete for everyone or not
  };
  const [currentReactionMessage, setCurrentReactionMessage] = useState<
    string[]
  >([]);
  const [showRichReaction, setShowRichReaction] = useState<boolean>(false);

  const setReaction = (messageId: string) => {
    setCurrentReactionMessage([chatId, messageId]);
    setShowRichReaction(true);
  };

  const unsetRichReaction = () => {
    setCurrentReactionMessage([]);
    setShowRichReaction(false);
  };

  const handleReaction = async (
    message: LoadedGroupMessage,
    reaction: string,
  ) => {
    const richReactionsData = await getRichReactions(
      message.chatId,
      message.messageId,
      false,
    );
    const selfReactionObj = richReactionsData.find(
      reactionData => reactionData.senderId === 'SELF',
    );
    const selfReaction = selfReactionObj ? selfReactionObj.reaction : false;
    if (selfReaction === reaction) {
      const sender = new SendMessage(message.chatId, ContentType.reaction, {
        chatId: message.chatId,
        messageId: message.messageId,
        reaction: '',
        tombstone: true,
      });
      await sender.send();
    } else {
      const sender = new SendMessage(message.chatId, ContentType.reaction, {
        chatId: message.chatId,
        messageId: message.messageId,
        reaction,
      });
      await sender.send();
    }
  };

  const onReaction = (message: LoadedGroupMessage, reaction: string) => {
    handleReaction(message, reaction);
    clearSelection();
  };

  const performDelete = async (): Promise<void> => {
    for (const msg of selectedMessages) {
      await cleanDeleteGroupMessage(chatId, msg);
    }
    updateAfterDeletion(selectedMessages);
    clearSelection();
    setOpenDeleteMessageModal(false);
    if (selectedMessage) {
      onCleanCloseFocus();
    }
  };

  const performGlobalDelete = async (): Promise<void> => {
    for (const msg of selectedMessages) {
      const sender = new SendMessage(chatId, ContentType.deleted, {
        messageIdToDelete: msg,
      });
      await sender.send();
    }
    updateAfterGlobalDeletion(selectedMessages);
    clearSelection();
    setOpenDeleteMessageModal(false);
    if (selectedMessage) {
      onCleanCloseFocus();
    }
  };

  //message to be replied to
  const [replyToMessage, setReplyToMessage] =
    useState<LoadedGroupMessage | null>(null);

  //handles toggling the select messages flow.
  const handleLongPress = (messageId: string): void => {
    //adds messageId to selected messages
    if (!selectedMessages.includes(messageId)) {
      setSelectedMessages([...selectedMessages, messageId]);
    }
  };

  //Handles selecting messages once select messages flow is toggled
  const handlePress = (
    messageId: string,
    contentType: ContentType,
  ): boolean | undefined => {
    if (contentType === ContentType.deleted) {
      return;
    }
    // if popup actions are visible,
    // close component
    if (isPopUpVisible) {
      togglePopUp();
    }
    // if emoji keyboard is visible
    // close component
    if (isEmojiSelectorVisible) {
      setIsEmojiSelectorVisible(p => !p);
    }
    // removes messageId from selected messages on short press
    let isSelectionMode = selectionMode ? true : false;
    if (selectedMessages.includes(messageId)) {
      const newSelection = selectedMessages.filter(
        selectedMessageId => selectedMessageId !== messageId,
      );
      if (newSelection.length === 0) {
        setSelectionMode(false);
      }
      setSelectedMessages(newSelection);
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
    return isSelectionMode;
  };

  const onCopy = async () => {
    let copyString = '';
    try {
      for (let i = 0; i < selectedMessages.length; i++) {
        const message = selectedMessages[i];
        const endChar = i === selectedMessages.length - 1 ? '' : '\n';
        const msg = await getGroupMessage(chatId, message);
        if (msg) {
          switch (msg.contentType) {
            case ContentType.text: {
              //Formatting multiple messages into a single string.
              copyString += (msg.data as TextParams).text + endChar;
              break;
            }
            case ContentType.link: {
              copyString += (msg.data as LinkParams).text + endChar;
              break;
            }
            case ContentType.image: {
              copyString +=
                ((msg.data as LargeDataParams).text || '') + endChar;
              break;
            }
            case ContentType.video: {
              copyString +=
                ((msg.data as LargeDataParams).text || '') + endChar;
              break;
            }
            case ContentType.file: {
              copyString +=
                ((msg.data as LargeDataParams).text || '') + endChar;
              break;
            }
            default:
              //throw new Error('Unsupported copy type');
              break;
          }
        }
      }
      console.log('copying: , ', copyString);
      Clipboard.setString(copyString);
      messageCopied();
    } catch (error) {
      console.log('Error copying messages', error);
    }
    clearSelection();
  };

  const onForward = () => {
    const msgs = [...selectedMessages];
    clearSelection();
    navigation.navigate('ForwardToContact', {
      chatId: chatId,
      messages: msgs,
    });
  };

  const clearSelection = () => {
    setSelectedMessages([]);
    setSelectedMessage(null);
    setSelectionMode(false);
  };
  const clearEverything = () => {
    setSelectedMessages([]);
    setReplyToMessage(null);
    setSelectedMessage(null);
    setSelectionMode(false);
  };

  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [selectedMessage, setSelectedMessage] =
    useState<SelectedMessageType | null>(null);

  const [selectionMode, setSelectionMode] = useState(false);

  const onCloseFocus = () => {
    setSelectedMessage(null);
  };

  const onCleanCloseFocus = () => {
    clearSelection();
  };

  const onSelect = () => {
    setSelectionMode(true);
    onCloseFocus();
  };

  const onReport = () => {
    const isReported =
      reportedMessages?.length === 0 || reportedMessages === null
        ? false
        : selectedMessage?.message &&
          reportedMessages.includes(selectedMessage?.message?.messageId);

    if (isReported) {
      MessageAlreadyReportedError();
      onCleanCloseFocus();
    } else {
      setShowReportModal(true);
    }
  };

  const onDelete = () => {
    determineDeleteModalDisplay();
  };

  const onReply = async (): Promise<void> => {
    setMessageToEdit(null);

    if (selectedMessages.length > 0) {
      const reply = await getLoadedGroupMessage(chatId, selectedMessages[0]);
      if (reply) {
        setReplyToMessage(reply);
      }
    }
    onCleanCloseFocus();
  };

  const updateAfterDeletion = (messageIds: string[]): void => {
    setMessages(messages =>
      messages.filter(message => !messageIds.includes(message.messageId)),
    );
    setSelectedMessages([]);
  };

  const updateAfterGlobalDeletion = (messageIds: string[]): void => {
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
  const onEditMessage = () => {
    setMessageToEdit(selectedMessage);
  };
  useMemo(() => {
    if (messageToEdit) {
      setText(messageToEdit.message.data.text);
    }
  }, [messageToEdit]);

  return (
    <ChatContext.Provider
      value={{
        chatId,
        isGroupChat,
        isConnected,
        setIsConnected,
        profileUri,
        setProfileUri,
        permissions,
        setPermissions,
        permissionsId,
        setPermissionsId,
        name,
        setName,
        messagesLoaded,
        setMessagesLoaded,
        hasStarted,
        isScreenClickable,
        movingDown,
        sliderHeight,
        sliderHeightInitiaValue,
        permissionCardHeight,
        permissionIconHeight,
        moveSliderCompleteClosed,
        moveSliderIntermediateOpen,
        moveSliderCompleteOpen,
        currentReactionMessage,
        setCurrentReactionMessage,
        showRichReaction,
        setShowRichReaction,
        setReaction,
        unsetRichReaction,
        onReaction,
        replyToMessage,
        setReplyToMessage,
        selectedMessages,
        performGlobalDelete,
        performDelete,
        openDeleteMessageModal,
        setOpenDeleteMessageModal,
        setSelectedMessages,
        selectionMode,
        setText,
        text,
        setSelectionMode,
        handlePress,
        handleLongPress,
        onCopy,
        onForward,
        clearSelection,
        clearEverything,
        selectedMessage,
        setSelectedMessage,
        onCloseFocus,
        onCleanCloseFocus,
        showDeleteForEveryone,
        setShowDeleteForEveryone,
        reportedMessages,
        setReportedMessages,
        determineDeleteModalDisplay,
        onSelect,
        onDelete,
        onReport,
        showReportModal,
        setShowReportModal,
        onReply,
        setMessages,
        messages,
        onEditMessage,
        updateAfterDeletion,
        updateAfterGlobalDeletion,
        togglePopUp,
        isPopUpVisible,
        isEmojiSelectorVisible,
        setIsEmojiSelectorVisible,
        groupClass,
        setGroupClass,
      }}>
      {children}
    </ChatContext.Provider>
  );
};
