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
import {LoadedGroupMessage} from '@utils/Storage/DBCalls/groupMessage';
import {
  cleanDeleteGroupMessage,
  getGroupMessage,
  getLoadedGroupMessage,
} from '@utils/Storage/groupMessages';
import Group from '@utils/Groups/GroupClass';

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
  name: string;
  setName: (x: string) => void;
  messagesLoaded: boolean;
  setMessagesLoaded: (x: boolean) => void;
  text: string;
  setText: (x: string) => void;
  performGlobalDelete: (messageIds: string[]) => void;
  performDelete: (messageIds: string[]) => void;
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
    const showGlobalDelete = isDeleted ? !isDeleted : senderExists;
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

  const performDelete = async (messageIds: string[]): Promise<void> => {
    for (const msg of messageIds) {
      await cleanDeleteGroupMessage(chatId, msg, false);
    }
    updateAfterDeletion(messageIds);

    setOpenDeleteMessageModal(false);
    if (selectedMessage) {
      onCleanCloseFocus();
    }
  };

  const performGlobalDelete = async (messageIds: string[]): Promise<void> => {
    for (const msg of messageIds) {
      const sender = new SendMessage(chatId, ContentType.deleted, {
        messageIdToDelete: msg,
      });
      await sender.send();
    }
    updateAfterGlobalDeletion(messageIds);
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
    const isSelectionMode = selectionMode ? true : false;
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
    navigation.push('ForwardToContact', {
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
        name,
        setName,
        messagesLoaded,
        setMessagesLoaded,
        setMessageToEdit,
        messageToEdit,
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
