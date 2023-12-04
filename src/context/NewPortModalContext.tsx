import React, {createContext, useState, useContext, ReactNode} from 'react';

type ModalContextType = {
  modalVisible: boolean;
  showModal: () => void;
  hideModal: () => void;
  toggleModal: () => void;
};

const NewPortModalContext = createContext<ModalContextType | undefined>(
  undefined,
);

export const useNewPortModal = () => {
  const context = useContext(NewPortModalContext);
  if (!context) {
    throw new Error('useNewPortModal must be used within a ModalProvider');
  }
  return context;
};

type ModalProviderProps = {
  children: ReactNode;
};

export const NewPortModalProvider: React.FC<ModalProviderProps> = ({
  children,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);
  const toggleModal = () => setModalVisible(!modalVisible);

  return (
    <NewPortModalContext.Provider
      value={{modalVisible, showModal, hideModal, toggleModal}}>
      {children}
    </NewPortModalContext.Provider>
  );
};
