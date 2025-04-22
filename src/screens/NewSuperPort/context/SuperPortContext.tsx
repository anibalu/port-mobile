import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react';

import SuperPortGenerator from '@utils/Ports/SuperPorts/SuperPortGenerator/SuperPortGenerator';
import { PermissionsStrict } from '@utils/Storage/DBCalls/permissions/interfaces';

interface SuperPortContextState {
  permissions?: PermissionsStrict;
  folderId?: string;
  label?: string;
  limit?: number | null;
  connectionsMade?: number | null;
  port?: SuperPortGenerator;
}

type SuperPortAction =
  | { type: 'SET_PERMISSIONS'; payload: PermissionsStrict }
  | { type: 'SET_FOLDER_ID'; payload: string }
  | { type: 'SET_LABEL'; payload: string }
  | { type: 'SET_LIMIT'; payload: number | null }
  | { type: 'INCREMENT_CONNECTIONS_MADE'; payload: undefined }
  | { type: 'SET_PORT'; payload: SuperPortGenerator }
  | { type: 'SET_CONTEXT'; payload: SuperPortContextState };

const SuperPortStateContext = createContext<SuperPortContextState | undefined>(
  undefined
);
const SuperPortDispatchContext = createContext<
  React.Dispatch<SuperPortAction> | undefined
>(undefined);

type ModalProviderProps = {
  children: ReactNode;
};

const superPortReducer = (
  state: SuperPortContextState,
  action: SuperPortAction
): SuperPortContextState => {
  switch (action.type) {
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };
    case 'SET_FOLDER_ID':
      return { ...state, folderId: action.payload };
    case 'SET_LABEL':
      return { ...state, label: action.payload };
    case 'SET_LIMIT':
      return { ...state, limit: action.payload };
    case 'INCREMENT_CONNECTIONS_MADE':
      return { ...state, connectionsMade: state.connectionsMade ? state.connectionsMade + 1 : 1 };
    case 'SET_PORT':
      return { ...state, port: action.payload };
    case 'SET_CONTEXT':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export const SuperPortProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(superPortReducer, {});

  const stateValue = useMemo(() => state, [state]);

  return (
    <SuperPortStateContext.Provider value={stateValue}>
      <SuperPortDispatchContext.Provider value={dispatch}>
        {children}
      </SuperPortDispatchContext.Provider>
    </SuperPortStateContext.Provider>
  );
};

// Hooks for accessing state and dispatch
export function useSuperPortState() {
  const context = useContext(SuperPortStateContext);
  if (context === undefined) {
    throw new Error('useSuperPortState must be used within a SuperPortProvider');
  }
  return context;
}

export function useSuperPortDispatch() {
  const context = useContext(SuperPortDispatchContext);
  if (context === undefined) {
    throw new Error('useSuperPortDispatch must be used within a SuperPortProvider');
  }
  return context;
}