import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import SuperPortGenerator from '@utils/Ports/SuperPorts/SuperPortGenerator/SuperPortGenerator';

interface SuperPortContextState {
  permissions?: PermissionsStrict;
  folderId?: string;
  label?: string;
  limit?: number | null;
  port?: SuperPortGenerator;
}

interface SuperPortContextActions {
  setPermissions: (permissions: PermissionsStrict) => void;
  setFolderId: (folderId: string) => void;
  setLabel: (label: string) => void;
  setLimit: (limit?: number | null) => void;
  setPort: (port: SuperPortGenerator) => void;
}

const SuperPortStateContext = createContext<SuperPortContextState | undefined>(
  undefined,
);
const SuperPortActionsContext = createContext<
  SuperPortContextActions | undefined
>(undefined);

type ModalProviderProps = {
  children: ReactNode;
};

export const SuperPortProvider: React.FC<ModalProviderProps> = ({children}) => {
  // State variables
  const [permissions, setPermissions] = useState<PermissionsStrict | undefined>(
    undefined,
  );
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [label, setLabel] = useState<string | undefined>(undefined);
  const [limit, setLimit] = useState<number | null | undefined>(undefined);
  const [port, setPort] = useState<SuperPortGenerator | undefined>(undefined);

  // Memoize the state object to prevent unnecessary re-renders
  const stateValue = useMemo(
    () => ({
      permissions,
      folderId,
      label,
      limit,
      port,
    }),
    [permissions, folderId, label, limit, port],
  );

  // Memoize the actions object
  const actions = useMemo(
    () => ({
      setPermissions: (newPermissions: PermissionsStrict) =>
        setPermissions(newPermissions),
      setFolderId: (newFolderId: string) => setFolderId(newFolderId),
      setLabel: (newLabel: string) => setLabel(newLabel),
      setLimit: (newLimit?: number | null) => setLimit(newLimit),
      setPort: (newPort: SuperPortGenerator) => setPort(newPort),
    }),
    [],
  );

  return (
    <SuperPortStateContext.Provider value={stateValue}>
      <SuperPortActionsContext.Provider value={actions}>
        {children}
      </SuperPortActionsContext.Provider>
    </SuperPortStateContext.Provider>
  );
};

// Create selective hooks for accessing specific parts of state
export function useSuperPortPermissions() {
  const context = useContext(SuperPortStateContext);
  if (context === undefined) {
    throw new Error(
      'useSuperPortPermissions must be used within a SuperPortProvider',
    );
  }
  return {
    permissions: context.permissions,
    setPermissions: useContext(SuperPortActionsContext)!.setPermissions,
  };
}

export function useSuperPortFolder() {
  const context = useContext(SuperPortStateContext);
  if (context === undefined) {
    throw new Error(
      'useSuperPortFolder must be used within a SuperPortProvider',
    );
  }
  return {
    folderId: context.folderId,
    setFolderId: useContext(SuperPortActionsContext)!.setFolderId,
  };
}

export function useSuperPortLabel() {
  const context = useContext(SuperPortStateContext);
  if (context === undefined) {
    throw new Error(
      'useSuperPortLabel must be used within a SuperPortProvider',
    );
  }
  return {
    label: context.label,
    setLabel: useContext(SuperPortActionsContext)!.setLabel,
  };
}

export function useSuperPortLimit() {
  const context = useContext(SuperPortStateContext);
  if (context === undefined) {
    throw new Error(
      'useSuperPortLimit must be used within a SuperPortProvider',
    );
  }
  return {
    limit: context.limit,
    setLimit: useContext(SuperPortActionsContext)!.setLimit,
  };
}

export function useSuperPort() {
  const context = useContext(SuperPortStateContext);
  if (context === undefined) {
    throw new Error('useSuperPort must be used within a SuperPortProvider');
  }
  return {
    port: context.port,
    setPort: useContext(SuperPortActionsContext)!.setPort,
  };
}

// For components that need multiple values, create custom selector hooks
export function useSuperPortData<T>(
  selector: (state: SuperPortContextState) => T,
) {
  const context = useContext(SuperPortStateContext);
  if (context === undefined) {
    throw new Error('useSuperPortData must be used within a SuperPortProvider');
  }
  return selector(context);
}

// Access to all actions
export function useSuperPortActions() {
  const context = useContext(SuperPortActionsContext);
  if (context === undefined) {
    throw new Error(
      'useSuperPortActions must be used within a SuperPortProvider',
    );
  }
  return context;
}
