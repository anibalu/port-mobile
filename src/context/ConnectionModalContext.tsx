import React, {createContext, useState, useContext, ReactNode} from 'react';

type ModalContextType = {
  //controls new port modal
  newPortModalVisible: boolean;
  showNewPortModal: () => void;
  hideNewPortModal: () => void;
  toggleNewPortModal: () => void;
  //controls superports modal
  superportModalVisible: boolean;
  showSuperportModal: () => void;
  hideSuperportModal: () => void;
  toggleSuperportModal: () => void;
  //controls superport create modal
  superportCreateModalVisible: boolean;
  connectionSuperportId: string;
  setConnectionSuperportId: (x: string) => void;
  showSuperportCreateModal: () => void;
  hideSuperportCreateModal: () => void;
  toggleSuperportCreateModal: () => void;
};

const ConnectionModalContext = createContext<ModalContextType | undefined>(
  undefined,
);

export const useConnectionModal = () => {
  const context = useContext(ConnectionModalContext);
  if (!context) {
    throw new Error('useConnectionModal must be used within a ModalProvider');
  }
  return context;
};

type ModalProviderProps = {
  children: ReactNode;
};

export const ConnectionModalProvider: React.FC<ModalProviderProps> = ({
  children,
}) => {
  const [newPortModalVisible, setNewPortModalVisible] =
    useState<boolean>(false);
  const showNewPortModal = () => setNewPortModalVisible(true);
  const hideNewPortModal = () => setNewPortModalVisible(false);
  const toggleNewPortModal = () => setNewPortModalVisible(!newPortModalVisible);

  const [superportModalVisible, setSuperportModalVisible] =
    useState<boolean>(false);
  const showSuperportModal = () => setSuperportModalVisible(true);
  const hideSuperportModal = () => setSuperportModalVisible(false);
  const toggleSuperportModal = () =>
    setSuperportModalVisible(!superportModalVisible);

  const [superportCreateModalVisible, setSuperportCreateModalVisible] =
    useState<boolean>(false);
  const [contextSuperportId, setContextSuperportId] = useState<string>('');
  const setConnectionSuperportId = (x: string) => setContextSuperportId(x);
  const showSuperportCreateModal = () => setSuperportCreateModalVisible(true);
  const hideSuperportCreateModal = () => setSuperportCreateModalVisible(false);
  const toggleSuperportCreateModal = () =>
    setSuperportCreateModalVisible(!superportCreateModalVisible);
  return (
    <ConnectionModalContext.Provider
      value={{
        newPortModalVisible: newPortModalVisible,
        showNewPortModal: showNewPortModal,
        hideNewPortModal: hideNewPortModal,
        toggleNewPortModal: toggleNewPortModal,
        superportModalVisible: superportModalVisible,
        showSuperportModal: showSuperportModal,
        hideSuperportModal: hideSuperportModal,
        toggleSuperportModal: toggleSuperportModal,
        superportCreateModalVisible: superportCreateModalVisible,
        connectionSuperportId: contextSuperportId,
        setConnectionSuperportId: setConnectionSuperportId,
        showSuperportCreateModal: showSuperportCreateModal,
        hideSuperportCreateModal: hideSuperportCreateModal,
        toggleSuperportCreateModal: toggleSuperportCreateModal,
      }}>
      {children}
    </ConnectionModalContext.Provider>
  );
};
