import {SELECTED_MESSAGES_LIMIT} from '@configs/constants';
import {
  ContentType,
  LargeDataParams,
  LinkParams,
  SavedMessageParams,
  TextParams,
} from '@utils/Messaging/interfaces';
import React, {createContext, useState, useContext} from 'react';
import {useErrorModal} from 'src/context/ErrorModalContext';
import Clipboard from '@react-native-clipboard/clipboard';
import {getGroupMessage, getMessage} from '@utils/Storage/messages';
import {getRichReactions} from '@utils/Storage/reactions';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {useNavigation} from '@react-navigation/native';

export interface SelectedMessageType {
  pageY: number;
  height: number;
  message: SavedMessageParams;
}

type ChatContextType = {
  //basic chat params
  chatId: string;
  isGroupChat: boolean;
  isConnected: boolean;
  setIsConnected: (x: boolean) => void;
  profileUri: string | undefined | null;
  setProfileUri: (x: string | undefined | null) => void;
  name: string;
  setName: (x: string) => void;
  messagesLoaded: boolean;
  setMessagesLoaded: (x: boolean) => void;

  //reactions context
  currentReactionMessage: string[];
  setCurrentReactionMessage: (x: string[]) => void;
  showRichReaction: boolean;
  setShowRichReaction: (x: boolean) => void;
  setReaction: (messageId: string) => void;
  unsetRichReaction: () => void;
  onReaction: (message: SavedMessageParams, reaction: string) => void;

  //message to be replied to
  replyToMessage: SavedMessageParams | null;
  setReplyToMessage: (x: SavedMessageParams | null) => void;

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
  handlePress: (messageId: string) => boolean;
  handleLongPress: (messageId: string) => void;

  //message actions
  onCopy: () => Promise<void>;
  onForward: () => void;
  clearSelection: () => void;
  clearEverything: () => void;

  //controls the visibility of a focused message bubble
  onCloseFocus: () => void;
  onCleanCloseFocus: () => void;
  onSelect: () => void;
  onDelete: () => void;
  onReply: () => Promise<void>;
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
  const {copyingMessageError, messageCopied} = useErrorModal();

  const [isConnected, setIsConnected] = useState(connected);
  const [profileUri, setProfileUri] = useState(avatar);
  const [name, setName] = useState<string>(displayName || '');
  const [messagesLoaded, setMessagesLoaded] = useState(false);

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
    message: SavedMessageParams,
    reaction: string,
  ) => {
    const richReactionsData = await getRichReactions(
      message.chatId,
      message.messageId,
    );

    const selfReactionObj = richReactionsData.find(
      reaction => reaction.senderId === 'SELF',
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
        //Since these are for DMs we will define an ID that identifies the sender locally.
        //Note that for the recevier, this flips and they themselves are the sender
        reaction,
      });
      await sender.send();
    }
  };

  const onReaction = (message: SavedMessageParams, reaction: string) => {
    handleReaction(message, reaction);
    clearSelection();
  };

  //message to be replied to
  const [replyToMessage, setReplyToMessage] =
    useState<SavedMessageParams | null>(null);

  //handles toggling the select messages flow.
  const handleLongPress = (messageId: string): void => {
    //adds messageId to selected messages
    if (!selectedMessages.includes(messageId)) {
      setSelectedMessages([...selectedMessages, messageId]);
    }
  };

  //Handles selecting messages once select messages flow is toggled
  const handlePress = (messageId: string): boolean => {
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
        const endChar = i !== selectedMessages.length - 1 ? '\n' : '';
        const msg = await getMessage(chatId, message);
        if (msg) {
          switch (msg.contentType) {
            case ContentType.text: {
              //Formatting multiple messages into a single string.
              copyString += (msg.data as TextParams).text + endChar;
              setSelectedMessages([]);
              break;
            }
            case ContentType.link: {
              copyString += (msg.data as LinkParams).text + endChar;
              setSelectedMessages([]);
              break;
            }
            case ContentType.image: {
              copyString +=
                ((msg.data as LargeDataParams).text || '') + endChar;
              setSelectedMessages([]);
              break;
            }
            case ContentType.video: {
              copyString +=
                ((msg.data as LargeDataParams).text || '') + endChar;
              setSelectedMessages([]);
              break;
            }
            case ContentType.file: {
              copyString +=
                ((msg.data as LargeDataParams).text || '') + endChar;
              setSelectedMessages([]);
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
  };
  const clearEverything = () => {
    setSelectedMessages([]);
    setReplyToMessage(null);
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

  const onDelete = () => {
    onSelect();
  };

  const onReply = async (): Promise<void> => {
    if (selectedMessages.length > 0) {
      setReplyToMessage(
        isGroupChat
          ? await getGroupMessage(chatId, selectedMessages[0])
          : await getMessage(chatId, selectedMessages[0]),
      );
    }
    onCleanCloseFocus();
  };

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
        setSelectedMessages,
        selectionMode,
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
        onSelect,
        onDelete,
        onReply,
      }}>
      {children}
    </ChatContext.Provider>
  );
};
