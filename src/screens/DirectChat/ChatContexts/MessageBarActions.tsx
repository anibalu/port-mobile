/**
 * The message bar actions context.
 * Handles dispatching of operations to the message bar.
 */

import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';
import React, {createContext, useContext, useReducer} from 'react';

export enum MessageBarActionType {
  None = 0,
  Reply,
  Edit,
}

type MessageBarAction =
  | {
      action: MessageBarActionType.None;
    }
  | {
      action: MessageBarActionType.Reply | MessageBarActionType.Edit;
      message: LoadedMessage;
    };

function messageBarActionReducer(
  _state: MessageBarAction,
  action: MessageBarAction,
) {
  console.log('Triggered new action');
  return action;
}

type MessageBarActionsContext_t = {
  messageBarAction: MessageBarAction;
  dispatchMessageBarAction: (action: MessageBarAction) => void;
};

const MessageBarActionsContext = createContext<
  MessageBarActionsContext_t | undefined
>(undefined);

export const useMessageBarActionsContext = () => {
  const context = useContext(MessageBarActionsContext);
  if (!context) {
    throw new Error('[MESSAGE BAR ACTIONS CONTEXT] Could not use context');
  }
  return context;
};

export const MessageBarActionsContextProvider = ({
  children,
}: {
  children: any;
}) => {
  const [messageBarAction, dispatchMessageBarAction] = useReducer(
    messageBarActionReducer,
    {action: MessageBarActionType.None},
  );

  return (
    <MessageBarActionsContext.Provider
      value={{
        messageBarAction,
        dispatchMessageBarAction,
      }}>
      {children}
    </MessageBarActionsContext.Provider>
  );
};
