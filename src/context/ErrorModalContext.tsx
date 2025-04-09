import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {ERROR_MODAL_VALIDITY_TIMEOUT} from '@configs/constants';

type ModalContextType = {
  modalVisible: boolean;
  notifyUserOfConnectionError: () => void;
  unableToNotifyUserError: () => void;
  mediaDownloadError: () => void;
  compressionError: () => void;
  MessageDataTooBigError: () => void;
  FileTooLarge: () => void;
  copyingMessageError: () => void;
  DisconnectChatError: () => void;
  ReportSubmittedError: () => void;
  ReportSubmittedSuccess: () => void;
  messageCopied: () => void;
  MessageAlreadyReportedError: () => void;
  componentNotSupportedyetError: () => void;
  shareFeedbackSucceess: () => void;
  shareFeedbackError: () => void;
  errorToShow: ErrorObject;
};
type ErrorObject = {
  text: string;
  type: 'success' | 'error' | 'warning';
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

  const ReportSubmittedSuccess = () => {
    setErrorToShow({
      text: 'Report submitted',
      type: 'success',
    });
  };

  const ReportSubmittedError = () => {
    setErrorToShow({
      text: 'Error submitting report. Please check your network connection',
      type: 'error',
    });
  };

  const DisconnectChatError = () => {
    setErrorToShow({
      text: 'Error disconnecting chat. Please check your network connection',
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

  const copyingMessageError = () => {
    setErrorToShow({
      text: 'cannot copy this message',
      type: 'error',
    });
  };

  const MessageAlreadyReportedError = () => {
    setErrorToShow({
      text: 'Message already reported!',
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
        notifyUserOfConnectionError,
        unableToNotifyUserError,
        compressionError,
        copyingMessageError,
        mediaDownloadError,
        DisconnectChatError,
        ReportSubmittedError,
        ReportSubmittedSuccess,
        MessageDataTooBigError,
        FileTooLarge,
        messageCopied,
        MessageAlreadyReportedError,
        componentNotSupportedyetError,
        shareFeedbackSucceess,
        shareFeedbackError,
      }}>
      {children}
    </ErrorModalContext.Provider>
  );
};
