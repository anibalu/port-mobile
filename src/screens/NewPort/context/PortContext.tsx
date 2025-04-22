import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react';

import PortGenerator from '@utils/Ports/SingleUsePorts/PortGenerator/PortGenerator';
import { PermissionsStrict } from '@utils/Storage/DBCalls/permissions/interfaces';

interface PortContextState {
  permissions?: PermissionsStrict;
  folderId?: string;
  contactName?: string;
  port?: PortGenerator;
}

type PortAction =
  | { type: 'SET_PERMISSIONS'; payload: PermissionsStrict }
  | { type: 'SET_FOLDER_ID'; payload: string }
  | { type: 'SET_CONTACT_NAME'; payload: string }
  | { type: 'SET_PORT'; payload: PortGenerator }
  | { type: 'SET_CONTEXT'; payload: PortContextState };

const PortStateContext = createContext<PortContextState | undefined>(undefined);
const PortDispatchContext = createContext<React.Dispatch<PortAction> | undefined>(undefined);

type ModalProviderProps = {
  children: ReactNode;
};

const portReducer = (state: PortContextState, action: PortAction): PortContextState => {
  switch (action.type) {
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };
    case 'SET_FOLDER_ID':
      return { ...state, folderId: action.payload };
    case 'SET_CONTACT_NAME':
      return { ...state, contactName: action.payload };
    case 'SET_PORT':
      return { ...state, port: action.payload };
    case 'SET_CONTEXT':
      return {
        ...state,
        ...action.payload,
      };
    default:
      throw new Error(`Unhandled action type: ${action}`);
  }
};

export const PortProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(portReducer, {});

  const stateValue = useMemo(() => state, [state]);

  return (
    <PortStateContext.Provider value={stateValue}>
      <PortDispatchContext.Provider value={dispatch}>
        {children}
      </PortDispatchContext.Provider>
    </PortStateContext.Provider>
  );
};

// Hooks for accessing state and dispatch
export function usePortState() {
  const context = useContext(PortStateContext);
  if (context === undefined) {
    throw new Error('usePortState must be used within a PortProvider');
  }
  return context;
}

export function usePortDispatch() {
  const context = useContext(PortDispatchContext);
  if (context === undefined) {
    throw new Error('usePortDispatch must be used within a PortProvider');
  }
  return context;
}
