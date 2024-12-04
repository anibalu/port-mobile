/**
 * This context tracking of selected messages
 */

import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';
import React, {createContext, useContext, useState} from 'react';

export enum MessageSelectionMode {
  Single,
  Multiple,
}

export type MessageLayout = {
  y?: number;
  height?: number;
};

type MessageSelectionContext_t = {
  selectedMessages: LoadedMessage[];
  setSelectedMessages: (message: LoadedMessage[]) => void;
  selectionMode: MessageSelectionMode;
  setSelectionMode: (newMode: MessageSelectionMode) => void;
  toggleSelected: (message: LoadedMessage, layout: MessageLayout) => void;
  selectedMessageLayout: MessageLayout;
  richReactionMessage: string | null;
  setRichReactionMessage: (messageId: string | null) => void;
};

const SelectionContext = createContext<MessageSelectionContext_t | undefined>(
  undefined,
);

export const useSelectionContext = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('[SELECTION CONTEXT] Could not use context');
  }
  return context;
};

export const SelectionContextProvider = ({children}: {children: any}) => {
  const [selectedMessages, setSelectedMessages] = useState<LoadedMessage[]>([]);
  const [selectionMode, setSelectionMode] = useState<MessageSelectionMode>(
    MessageSelectionMode.Single,
  );
  const [richReactionMessage, setRichReactionMessage] = useState<string | null>(
    null,
  );
  const [selectedMessageLayout, setSelectedMessageLayout] =
    useState<MessageLayout>({});
  /**
   * Updates state when you either select or unselect a message
   * @param message The message to act based on
   * @returns
   */
  function toggleSelected(
    message: LoadedMessage,
    messageLayout?: MessageLayout,
  ) {
    console.info('toggling selected');
    if (MessageSelectionMode.Single === selectionMode) {
      // make sure we set the layout before we set the selected message
      // so that way the positions are available before we need to display the selected message
      setSelectedMessageLayout({
        ...selectedMessageLayout,
        height: messageLayout.height,
        y: messageLayout.y,
      });
      setSelectedMessages([message]);
      console.log(messageLayout);
      return;
    }
    console.info('toggling selected in multi mode');
    // If we're here, we're in multi-select mode
    let alreadySelected = false;
    selectedMessages.map(m => {
      if (m.messageId === message.messageId) {
        alreadySelected = true;
      }
    });
    console.log(alreadySelected);
    let updatedSelectedMessages: LoadedMessage[];
    if (alreadySelected) {
      // Remove the message from the selected message list
      updatedSelectedMessages = selectedMessages.filter(
        m => m.messageId !== message.messageId,
      );
    } else {
      // add this message to the list
      updatedSelectedMessages = [...selectedMessages, message];
    }
    setSelectedMessages(updatedSelectedMessages);
    // If there are no more selected messages, return to single select mode
    if (updatedSelectedMessages.length === 0) {
      setSelectionMode(MessageSelectionMode.Single);
    }
    // console.log(selectedMessages);
  }

  return (
    <SelectionContext.Provider
      value={{
        selectionMode,
        setSelectionMode,
        selectedMessages,
        setSelectedMessages,
        toggleSelected,
        selectedMessageLayout,
        richReactionMessage,
        setRichReactionMessage,
      }}>
      {children}
    </SelectionContext.Provider>
  );
};
