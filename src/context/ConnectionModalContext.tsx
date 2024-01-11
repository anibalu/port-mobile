import {isIOS} from '@components/ComponentUtils';
import {useNavigation} from '@react-navigation/native';
import {handleDeepLink} from '@utils/DeepLinking';
import {ContentType} from '@utils/Messaging/interfaces';
import {
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PortBundle,
} from '@utils/Ports/interfaces';
import {FileAttributes} from '@utils/Storage/interfaces';
import {wait} from '@utils/Time';
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Linking} from 'react-native';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import {useErrorModal} from './ErrorModalContext';

type ModalContextType = {
  //controls incoming connection modal
  femaleModal: boolean;
  setFemaleModal: (x: boolean) => void;
  connectionModalVisible: boolean;
  connectionQRData:
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle
    | undefined;
  setConnectionQRData: (
    x:
      | PortBundle
      | GroupBundle
      | DirectSuperportBundle
      | GroupSuperportBundle
      | undefined,
  ) => void;
  connectionChannel: string | null;
  setConnectionChannel: (x: string | null) => void;
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

const imageRegex = /jpg|jpeg|png|gif|image$/;
const videoRegex = /mp4|video$/;

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
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle
    | undefined
  >(undefined);
  const [connectionChannel, setConnectionChannel] = useState<string | null>(
    null,
  );
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
    await wait(300);
  };
  const {portConnectionError} = useErrorModal();

  const navigation = useNavigation<any>();

  const handleFilesOps = (files: any) => {
    const sharingMessageObjects = [];
    let isText = false;

    if (files) {
      for (const file of files) {
        const payloadFile: FileAttributes = {
          fileUri: isIOS ? file.filePath : 'file://' + file.filePath || '',
          fileType: file.mimeType || '',
          fileName: file.fileName || '',
        };

        //Text has been shared
        if (
          payloadFile.fileUri === 'file://null' ||
          payloadFile.fileUri === null
        ) {
          sharingMessageObjects.push(file.text);
          isText = true;
          console.log('File received is: ', sharingMessageObjects);
        } else {
          const msg = {
            contentType: imageRegex.test(file.mimeType)
              ? ContentType.image
              : videoRegex.test(file.mimeType)
              ? ContentType.video
              : ContentType.file,
            data: {...payloadFile},
          };
          sharingMessageObjects.push(msg);
        }
      }

      navigation.navigate('SelectShareContacts', {
        shareMessages: sharingMessageObjects,
        isText,
      });
    }
  };

  useEffect(() => {
    ReceiveSharingIntent.getReceivedFiles(
      handleFilesOps,
      (error: any) => {
        console.log('Error sharing into RN:', error);
      },
      'PortShare', // share url protocol (must be unique to your app, suggest using your apple bundle id)
    );
    Linking.addEventListener('url', checkDeeplink);

    return () => {
      Linking.removeAllListeners('url');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkDeeplink = async ({url}: {url: string}) => {
    // Checking if PortShare (share into port) is being triggered
    if (url.startsWith('PortShare')) {
      console.log('Here');
      return null;
    } else {
      const bundle = await handleDeepLink({url: url});
      if (bundle) {
        setConnectionQRData(bundle);
        setFemaleModal(true);
        showConnectionModal();
      } else {
        portConnectionError();
      }
    }
  };

  // Handle any potential deeplinks while foregrounded/backgrounded

  return (
    <ConnectionModalContext.Provider
      value={{
        femaleModal: femaleModal,
        setFemaleModal: setFemaleModal,
        connectionQRData: connectionQRData,
        setConnectionQRData: setConnectionQRData,
        connectionChannel: connectionChannel,
        setConnectionChannel: setConnectionChannel,
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
