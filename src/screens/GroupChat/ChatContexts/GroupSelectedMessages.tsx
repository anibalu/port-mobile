/**
 * This context tracking of selected messages from a group
 */

import React, {createContext, useContext, useState} from 'react';

import {LoadedGroupMessage} from '@utils/Storage/DBCalls/groupMessage';

export enum GroupMessageSelectionMode {
  Single,
  Multiple,
}

export type GroupMessageLayout = {
  y?: number;
  height?: number;
};

type GroupMessageSelectionContext_t = {
  selectedMessages: LoadedGroupMessage[];
  setSelectedMessages: (message: LoadedGroupMessage[]) => void;
  selectionMode: GroupMessageSelectionMode;
  setSelectionMode: (newMode: GroupMessageSelectionMode) => void;
  toggleSelected: (
    message: LoadedGroupMessage,
    layout: GroupMessageLayout,
  ) => void;
  selectedMessageLayout: GroupMessageLayout;
  richReactionMessage: string | null;
  setRichReactionMessage: (messageId: string | null) => void;
};

const GroupSelectionContext = createContext<
  GroupMessageSelectionContext_t | undefined
>(undefined);

export const useSelectionContext = () => {
  const context = useContext(GroupSelectionContext);
  if (!context) {
    throw new Error('[SELECTION CONTEXT] Could not use context');
  }
  return context;
};

export const GroupSelectionContextProvider = ({children}: {children: any}) => {
  const [selectedMessages, setSelectedMessages] = useState<
    LoadedGroupMessage[]
  >([]);
  const [selectionMode, setSelectionMode] = useState<GroupMessageSelectionMode>(
    GroupMessageSelectionMode.Single,
  );
  const [richReactionMessage, setRichReactionMessage] = useState<string | null>(
    null,
  );
  const [selectedMessageLayout, setSelectedMessageLayout] =
    useState<GroupMessageLayout>({});
  /**
   * Updates state when you either select or unselect a message
   * @param message The message to act based on
   * @returns
   */

  function toggleSelected(
    message: LoadedGroupMessage,
    messageLayout?: GroupMessageLayout,
  ) {
    console.info('toggling selected');
    if (GroupMessageSelectionMode.Single === selectionMode) {
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
    let updatedSelectedMessages: LoadedGroupMessage[];
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
      setSelectionMode(GroupMessageSelectionMode.Single);
    }
    // console.log("selectedMessagesselectedMessagesselectedMessages", JSON.stringify(selectedMessages, null, 2)  );
  }

  return (
    <GroupSelectionContext.Provider
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
    </GroupSelectionContext.Provider>
  );
};
