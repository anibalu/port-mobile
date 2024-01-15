import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  FC,
  useEffect,
} from 'react';
import Info from '@assets/icons/RedInfo.svg';
import Error from '@assets/icons/sadError.svg';
import {SvgProps} from 'react-native-svg';
import {ERROR_MODAL_VALIDITY_TIMEOUT} from '@configs/constants';

type ModalContextType = {
  modalVisible: boolean;
  establishingConnectionError: () => void;
  onboardingFailureError: () => void;
  checkingProfileError: () => void;
  portConnectionError: () => void;
  imageSelectionError: () => void;
  mediaDownloadError: () => void;
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
  Icon?: FC<SvgProps>;
  showGreen?: boolean;
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
    Icon: Info,
    showGreen: false,
  });

  // all error scenarios
  const personOfflineError = () => {
    setErrorToShow({
      text: 'Error establishing connection. Other person is offline.',
      Icon: Info,
    });
  };
  const mediaDownloadError = () => {
    setErrorToShow({
      text: 'Error downloading media, please try again later!',
      Icon: Info,
    });
  };
  const componentNotSupportedyetError = () => {
    setErrorToShow({
      text: 'This is not supported yet!',
      Icon: Info,
    });
  };

  const onboardingFailureError = () => {
    setErrorToShow({
      text: 'Error in setting you up, please check your network.',
      Icon: Error,
    });
  };
  const mediaLoadError = () => {
    setErrorToShow({
      text: 'Error loading media, please check if you have the necessary apps for the media.',
      Icon: Error,
    });
  };

  const unableToDisconnectError = () => {
    setErrorToShow({
      text: 'Unable to disconnect. Please try again when online.',
      Icon: Error,
    });
  };

  const unableToSharelinkError = () => {
    setErrorToShow({
      text: 'Unable to share link. Please try again when online.',
      Icon: Error,
    });
  };

  const unableToCreateGroupError = () => {
    setErrorToShow({
      text: 'Unable to create group. Please try again when online.',
      Icon: Error,
    });
  };

  const establishingConnectionError = () => {
    setErrorToShow({
      text: 'Error establishing connection. Generate new link.',
      Icon: Info,
    });
  };
  const checkingProfileError = () => {
    setErrorToShow({
      text: 'Error checking profile exists or not as app launches',
      Icon: Info,
    });
  };

  const portConnectionError = () => {
    setErrorToShow({
      text: 'New port connection error',
      Icon: Info,
    });
  };

  const portCreationError = () => {
    setErrorToShow({
      text: 'Network Error in creating new Port.',
      Icon: Info,
    });
  };

  const incorrectQRError = () => {
    setErrorToShow({
      text: 'QR code not a numberless QR code',
      Icon: Info,
    });
  };

  const imageSelectionError = () => {
    setErrorToShow({
      text: 'Image selection error',
      Icon: Info,
    });
  };

  const copyingMessageError = () => {
    setErrorToShow({
      text: 'Error! cannot copy this message ',
      Icon: Info,
    });
  };

  const somethingWentWrongError = () => {
    setErrorToShow({
      text: 'Oops something went wrong',
      Icon: Info,
    });
  };

  const networkError = () => {
    setErrorToShow({
      text: 'Error network error in creating new port',
      Icon: Info,
    });
  };
  const messageCopied = () => {
    setErrorToShow({
      text: 'Copied!',
      showGreen: true,
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
        imageSelectionError,
        copyingMessageError,
        somethingWentWrongError,
        networkError,
        mediaDownloadError,
        personOfflineError,
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
