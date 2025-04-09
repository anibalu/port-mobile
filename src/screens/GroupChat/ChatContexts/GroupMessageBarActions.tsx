/**
 * The group message bar actions context.
 * Handles dispatching of operations to the message bar.
 */

import React, {createContext, useContext, useReducer} from 'react';

import {LoadedGroupMessage} from '@utils/Storage/DBCalls/groupMessage';

export enum GroupMessageBarActionsType {
  None = 0,
  Reply,
  Edit,
}

type GroupMessageBarAction =
  | {
      action: GroupMessageBarActionsType.None;
    }
  | {
      action:
        | GroupMessageBarActionsType.Reply
        | GroupMessageBarActionsType.Edit;
      message: LoadedGroupMessage;
    };

function groupMessageBarActionReducer(
  _state: GroupMessageBarAction,
  action: GroupMessageBarAction,
) {
  console.log('Triggered new action');
  return action;
}

type GroupMessageBarActionsContext_t = {
  messageBarAction: GroupMessageBarAction;
  dispatchMessageBarAction: (action: GroupMessageBarAction) => void;
};

const GroupMessageBarActionsContext = createContext<
  GroupMessageBarActionsContext_t | undefined
>(undefined);

export const useMessageBarActionsContext = () => {
  const context = useContext(GroupMessageBarActionsContext);
  if (!context) {
    throw new Error('[MESSAGE BAR ACTIONS CONTEXT] Could not use context');
  }
  return context;
};

export const GroupMessageBarActionsContextProvider = ({
  children,
}: {
  children: any;
}) => {
  const [messageBarAction, dispatchMessageBarAction] = useReducer(
    groupMessageBarActionReducer,
    {action: GroupMessageBarActionsType.None},
  );

  return (
    <GroupMessageBarActionsContext.Provider
      value={{
        messageBarAction,
        dispatchMessageBarAction,
      }}>
      {children}
    </GroupMessageBarActionsContext.Provider>
  );
};
