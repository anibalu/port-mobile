import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import PortGenerator from '@utils/Ports/SingleUsePorts/PortGenerator/PortGenerator';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';

interface PortContextState {
  permissions?: PermissionsStrict;
  folderId?: string;
  contactName?: string;
  port?: PortGenerator;
}

interface PortContextActions {
  setPermissions: (permissions: PermissionsStrict) => void;
  setFolderId: (folderId: string) => void;
  setContactName: (contactName: string) => void;
  setPort: (port: PortGenerator) => void;
}

const PortStateContext = createContext<PortContextState | undefined>(undefined);
const PortActionsContext = createContext<PortContextActions | undefined>(
  undefined,
);

type ModalProviderProps = {
  children: ReactNode;
};

/**
 * PortProvider is a provider that provides the state and actions for the Port component.
 * It is used to manage the state of the Port component and the actions that can be performed on it.
 */
export const PortProvider: React.FC<ModalProviderProps> = ({children}) => {
  // State variables
  const [permissions, setPermissions] = useState<PermissionsStrict | undefined>(
    undefined,
  );
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [contactName, setContactName] = useState<string | undefined>(undefined);
  const [port, setPort] = useState<PortGenerator | undefined>(undefined);

  // Memoize the state object to prevent unnecessary re-renders
  const stateValue = useMemo(
    () => ({
      permissions,
      folderId,
      contactName,
      port,
    }),
    [permissions, folderId, contactName, port],
  );

  // Memoize the actions object
  const actions = useMemo(
    () => ({
      setPermissions: (newPermissions: PermissionsStrict) =>
        setPermissions(newPermissions),
      setFolderId: (newFolderId: string) => setFolderId(newFolderId),
      setContactName: (newContactName: string) =>
        setContactName(newContactName),
      setPort: (newPort: PortGenerator) => setPort(newPort),
    }),
    [],
  );

  return (
    <PortStateContext.Provider value={stateValue}>
      <PortActionsContext.Provider value={actions}>
        {children}
      </PortActionsContext.Provider>
    </PortStateContext.Provider>
  );
};

// Create selective hooks for accessing specific parts of state
export function usePortPermissions() {
  const context = useContext(PortStateContext);
  if (context === undefined) {
    throw new Error('usePortPermissions must be used within a PortProvider');
  }
  return {
    permissions: context.permissions,
    setPermissions: useContext(PortActionsContext)!.setPermissions,
  };
}

export function usePortFolder() {
  const context = useContext(PortStateContext);
  if (context === undefined) {
    throw new Error('usePortFolder must be used within a PortProvider');
  }
  return {
    folderId: context.folderId,
    setFolderId: useContext(PortActionsContext)!.setFolderId,
  };
}

export function usePortContact() {
  const context = useContext(PortStateContext);
  if (context === undefined) {
    throw new Error('usePortContact must be used within a PortProvider');
  }
  return {
    contactName: context.contactName,
    setContactName: useContext(PortActionsContext)!.setContactName,
  };
}

export function usePort() {
  const context = useContext(PortStateContext);
  if (context === undefined) {
    throw new Error('usePort must be used within a PortProvider');
  }
  return {
    port: context.port,
    setPort: useContext(PortActionsContext)!.setPort,
  };
}

// For components that need multiple values, create custom selector hooks
export function usePortData<T>(selector: (state: PortContextState) => T) {
  const context = useContext(PortStateContext);
  if (context === undefined) {
    throw new Error('usePortData must be used within a PortProvider');
  }
  return selector(context);
}

// Access to all actions
export function usePortActions() {
  const context = useContext(PortActionsContext);
  if (context === undefined) {
    throw new Error('usePortActions must be used within a PortProvider');
  }
  return context;
}
