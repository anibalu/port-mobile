import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {useSelector} from 'react-redux';

import {getUpdateStatusKeyFromLocal} from '@utils/TermsAndConditions';

type ModalContextType = {
  termsAndConditionsStatus: TermsAndConditionsStatus;
  onSoftModalClose: () => void;
  onHardModalClose: () => void;
  showHardUpdateInfoModal: boolean;
  showSoftUpdateInfoModal: boolean;
  updateStatusLoading: boolean;
  setUpdateStatusLoading: (loading: boolean) => void;
};

interface TermsAndConditionsStatus {
  shouldNotify: boolean;
  needsToAccept: boolean;
}

const defaultStatus: TermsAndConditionsStatus = {
  shouldNotify: false,
  needsToAccept: false,
};

const UpdateStatusContext = createContext<ModalContextType | undefined>(
  undefined,
);

export const useUpdateStatus = () => {
  const context = useContext(UpdateStatusContext);
  if (!context) {
    throw new Error(
      'useUpdateStatusContext must be used within a ModalProvider',
    );
  }
  return context;
};

type ModalProviderProps = {
  children: ReactNode;
};

export const UpdateStatusProvider: React.FC<ModalProviderProps> = ({
  children,
}) => {
  const [termsAndConditionsStatus, setTermsAndConditionsStatus] =
    useState(defaultStatus);
  const [showSoftUpdateInfoModal, setShowSoftUpdateInfoModal] =
    useState<boolean>(false);
  const [showHardUpdateInfoModal, setShowHardUpdateInfoModal] =
    useState<boolean>(false);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);

  const onSoftModalClose = async () => {
    setShowSoftUpdateInfoModal(false);
  };

  const onHardModalClose = async () => {
    setShowHardUpdateInfoModal(false);
  };

  const reloadTrigger = useSelector(
    state => state.triggerUpdateStatusRefetch.change,
  );

  useEffect(() => {
    // gets the object from localstorage and sets the state of modal to be shown
    (async () => {
      const localResponse = await getUpdateStatusKeyFromLocal();
      //if the key exist in localstorage with any value, wether both are same or indifferent, we will simply store that in state
      if (localResponse) {
        setTermsAndConditionsStatus(localResponse);
        if (localResponse.needsToAccept) {
          // if needsToAccept value in localstorage in true then show hard modal as this takes preferance
          setShowHardUpdateInfoModal(true);
        } else if (localResponse.shouldNotify) {
          // if shouldNotify value in localstorage in true then show soft modal
          setShowSoftUpdateInfoModal(true);
        }
      }
    })();
  }, [reloadTrigger]);

  return (
    <UpdateStatusContext.Provider
      value={{
        termsAndConditionsStatus,
        onHardModalClose,
        onSoftModalClose,
        showSoftUpdateInfoModal,
        showHardUpdateInfoModal,
        updateStatusLoading,
        setUpdateStatusLoading,
      }}>
      {children}
    </UpdateStatusContext.Provider>
  );
};
