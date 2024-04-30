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
  notifyUserOfConnectionError: () => void;
  unableToNotifyUserError: () => void;
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
  BackupRestoreError: () => void;
  messageCopied: () => void;
  componentNotSupportedyetError: () => void;
  shareFeedbackSucceess: () => void;
  shareFeedbackError: () => void;
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

  const BackupRestoreError = () => {
    setErrorToShow({
      text: 'Did not restore from backup',
      type: 'error',
    });
  };

  const personOfflineError = () => {
    setErrorToShow({
      text: 'Error establishing connection. Peer is offline.',
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

  const notifyUserOfConnectionError = () => {
    setErrorToShow({
      text: 'Notification sent to user',
      type: 'success',
    });
  };

  const unableToNotifyUserError = () => {
    setErrorToShow({
      text: 'Error while notifying user',
      type: 'error',
    });
  };

  const portConnectionError = () => {
    setErrorToShow({
      text: 'Error using Port. This link has expired.',
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
      text: 'QR code not a Port!',
      type: 'error',
    });
  };

  const imageSelectionError = () => {
    setErrorToShow({
      text: 'Could not select this image',
      type: 'error',
    });
  };

  const copyingMessageError = () => {
    setErrorToShow({
      text: 'cannot copy this message',
      type: 'error',
    });
  };

  const somethingWentWrongError = () => {
    setErrorToShow({
      text: 'Oops something went wrong...',
      type: 'error',
    });
  };

  const networkError = () => {
    setErrorToShow({
      text: 'Network error while creating a new Port',
      type: 'error',
    });
  };
  const messageCopied = () => {
    setErrorToShow({
      text: 'Copied!',
      type: 'success',
    });
  };

  const shareFeedbackSucceess = () => {
    setErrorToShow({
      text: 'Thanks for sharing your feedback.',
      type: 'success',
    });
  };

  const shareFeedbackError = () => {
    setErrorToShow({
      text: 'Network error while sending feedback. Please try again later',
      type: 'error',
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
        notifyUserOfConnectionError,
        unableToNotifyUserError,
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
        BackupRestoreError,
        mediaLoadError,
        unableToSharelinkError,
        portCreationError,
        incorrectQRError,
        onboardingFailureError,
        messageCopied,
        componentNotSupportedyetError,
        shareFeedbackSucceess,
        shareFeedbackError,
      }}>
      {children}
    </ErrorModalContext.Provider>
  );
};
