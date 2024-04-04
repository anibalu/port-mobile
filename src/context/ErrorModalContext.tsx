import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';

import {ERROR_MODAL_VALIDITY_TIMEOUT} from '@configs/constants';

type ModalContextType = {
  modalVisible: boolean;
  establishingConnectionError: () => void;
  onboardingFailureError: () => void;
  checkingProfileError: () => void;
  portConnectionError: () => void;
  imageSelectionError: () => void;
  mediaDownloadError: () => void;
  compressionError: () => void;
  MessageDataTooBigError: () => void;
  FileTooLarge: () => void;
  mediaLoadError: () => void;
  copyingMessageError: () => void;
  somethingWentWrongError: () => void;
  networkError: () => void;
  personOfflineError: () => void;
  unableToDisconnectError: () => void;
  unableToSharelinkError: () => void;
  unableToCreateGroupError: () => void;
  portCreationError: () => void;
  incorrectQRError: () => void;
  messageCopied: () => void;
  componentNotSupportedyetError: () => void;
  errorToShow: ErrorObject;
};
type ErrorObject = {
  text: string;
  type: 'success' | 'error';
};

const ErrorModalContext = createContext<ModalContextType | undefined>(
  undefined,
);

export const useErrorModal = () => {
  const context = useContext(ErrorModalContext);
  if (!context) {
    throw new Error('useErrorModal must be used within a ModalProvider');
  }
  return context;
};

type ModalProviderProps = {
  children: ReactNode;
};

export const ErrorModalProvider: React.FC<ModalProviderProps> = ({
  children,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [errorToShow, setErrorToShow] = useState<ErrorObject>({
    text: '',
    type: 'error',
  });

  // all error scenarios
  const FileTooLarge = () => {
    setErrorToShow({
      text: 'Your media was too large to share',
      type: 'error',
    });
  };

  const MessageDataTooBigError = () => {
    setErrorToShow({
      text: 'Your message was too long',
      type: 'error',
    });
  };

  const personOfflineError = () => {
    setErrorToShow({
      text: 'Error establishing connection. Other person is offline.',
      type: 'error',
    });
  };
  const mediaDownloadError = () => {
    setErrorToShow({
      text: 'Error downloading media, please try again later!',
      type: 'error',
    });
  };
  const compressionError = () => {
    setErrorToShow({
      text: 'Error compressing media, your media will be sent as is.',
      type: 'error',
    });
  };
  const componentNotSupportedyetError = () => {
    setErrorToShow({
      text: 'This is not supported yet!',
      type: 'error',
    });
  };

  const onboardingFailureError = () => {
    setErrorToShow({
      text: 'Error in setting you up, please check your network.',
      type: 'error',
    });
  };
  const mediaLoadError = () => {
    setErrorToShow({
      text: 'Error loading media, please check if you have the necessary apps for the media.',
      type: 'error',
    });
  };

  const unableToDisconnectError = () => {
    setErrorToShow({
      text: 'Unable to disconnect. Please try again when online.',
      type: 'error',
    });
  };

  const unableToSharelinkError = () => {
    setErrorToShow({
      text: 'Unable to share link. Please try again when online.',
      type: 'error',
    });
  };

  const unableToCreateGroupError = () => {
    setErrorToShow({
      text: 'Unable to create group. Please try again when online.',
      type: 'error',
    });
  };

  const establishingConnectionError = () => {
    setErrorToShow({
      text: 'Error establishing connection. Generate new link.',
      type: 'error',
    });
  };
  const checkingProfileError = () => {
    setErrorToShow({
      text: 'Error checking profile exists or not as app launches',
      type: 'error',
    });
  };

  const portConnectionError = () => {
    setErrorToShow({
      text: 'Error using port. This link has expired',
      type: 'error',
    });
  };

  const portCreationError = () => {
    setErrorToShow({
      text: 'Network Error in creating new Port.',
      type: 'error',
    });
  };

  const incorrectQRError = () => {
    setErrorToShow({
      text: 'QR code not a numberless QR code',
      type: 'error',
    });
  };

  const imageSelectionError = () => {
    setErrorToShow({
      text: 'Image selection error',
      type: 'error',
    });
  };

  const copyingMessageError = () => {
    setErrorToShow({
      text: 'Error cannot copy this message',
      type: 'error',
    });
  };

  const somethingWentWrongError = () => {
    setErrorToShow({
      text: 'Oops something went wrong',
      type: 'error',
    });
  };

  const networkError = () => {
    setErrorToShow({
      text: 'Error network error in creating new port',
      type: 'error',
    });
  };
  const messageCopied = () => {
    setErrorToShow({
      text: 'Copied!',
      type: 'success',
    });
  };

  useEffect(() => {
    //   to make the view disappear in 3 seconds
    if (errorToShow.text !== '') {
      setModalVisible(true);
      const timer = setTimeout(() => {
        setModalVisible(false);
      }, ERROR_MODAL_VALIDITY_TIMEOUT);
      return () => clearTimeout(timer);
    }
  }, [errorToShow]);

  return (
    <ErrorModalContext.Provider
      value={{
        modalVisible,
        errorToShow,
        unableToCreateGroupError,
        establishingConnectionError,
        checkingProfileError,
        portConnectionError,
        compressionError,
        imageSelectionError,
        copyingMessageError,
        somethingWentWrongError,
        networkError,
        mediaDownloadError,
        personOfflineError,
        MessageDataTooBigError,
        FileTooLarge,
        unableToDisconnectError,
        mediaLoadError,
        unableToSharelinkError,
        portCreationError,
        incorrectQRError,
        onboardingFailureError,
        messageCopied,
        componentNotSupportedyetError,
      }}>
      {children}
    </ErrorModalContext.Provider>
  );
};
