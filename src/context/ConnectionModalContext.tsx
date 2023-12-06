import {ConnectionBundle} from '@utils/Bundles/interfaces';
import {handleDeepLink} from '@utils/DeepLinking';
import React, {ReactNode, createContext, useContext, useState} from 'react';
import {Linking} from 'react-native';
import {useErrorModal} from './ErrorModalContext';
import {wait} from '@utils/Time';

type ModalContextType = {
  //controls incoming connection modal
  femaleModal: boolean;
  setFemaleModal: (x: boolean) => void;
  connectionModalVisible: boolean;
  connectionQRData: ConnectionBundle | undefined;
  setConnectionQRData: (x: ConnectionBundle | undefined) => void;
  showConnectionModal: () => void;
  hideConnectionModal: () => void;
  toggleConnectionModal: () => void;
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
  const [connectionQRData, setConnectionQRData] = useState<
    ConnectionBundle | undefined
  >(undefined);
  const [connectionModalVisible, setConnectionModalVisible] = useState(false);
  const [femaleModal, setFemaleModal] = useState(false);
  const showConnectionModal = async () => {
    await safeToggleFalse();
    setConnectionModalVisible(true);
  };
  const hideConnectionModal = () => setConnectionModalVisible(false);
  const toggleConnectionModal = () => setConnectionModalVisible(p => !p);

  const [newPortModalVisible, setNewPortModalVisible] =
    useState<boolean>(false);
  const showNewPortModal = async () => {
    await safeToggleFalse();
    setNewPortModalVisible(true);
  };
  const hideNewPortModal = () => setNewPortModalVisible(false);
  const toggleNewPortModal = () => setNewPortModalVisible(p => !p);

  const [superportModalVisible, setSuperportModalVisible] =
    useState<boolean>(false);
  const showSuperportModal = async () => {
    await safeToggleFalse();
    setSuperportModalVisible(true);
  };
  const hideSuperportModal = () => setSuperportModalVisible(false);
  const toggleSuperportModal = () => setSuperportModalVisible(p => !p);

  const [superportCreateModalVisible, setSuperportCreateModalVisible] =
    useState<boolean>(false);
  const [contextSuperportId, setContextSuperportId] = useState<string>('');
  const setConnectionSuperportId = (x: string) => setContextSuperportId(x);
  const showSuperportCreateModal = async () => {
    await safeToggleFalse();
    setSuperportCreateModalVisible(true);
  };
  const hideSuperportCreateModal = () => setSuperportCreateModalVisible(false);
  const toggleSuperportCreateModal = () =>
    setSuperportCreateModalVisible(p => !p);

  const safeToggleFalse = async () => {
    setConnectionModalVisible(false);
    setNewPortModalVisible(false);
    setSuperportModalVisible(false);
    setSuperportCreateModalVisible(false);
    await wait(100);
  };
  const {portConnectionError} = useErrorModal();

  const checkDeeplink = async ({url}: {url: string}) => {
    const bundle = await handleDeepLink({url: url});
    if (bundle) {
      setConnectionQRData(bundle);
      setFemaleModal(true);
      showConnectionModal();
    } else {
      portConnectionError();
    }
  };
  // Handle any potential deeplinks while foregrounded/backgrounded
  Linking.addEventListener('url', checkDeeplink);

  return (
    <ConnectionModalContext.Provider
      value={{
        femaleModal: femaleModal,
        setFemaleModal: setFemaleModal,
        connectionQRData: connectionQRData,
        setConnectionQRData: setConnectionQRData,
        connectionModalVisible: connectionModalVisible,
        showConnectionModal: showConnectionModal,
        hideConnectionModal: hideConnectionModal,
        toggleConnectionModal: toggleConnectionModal,
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
