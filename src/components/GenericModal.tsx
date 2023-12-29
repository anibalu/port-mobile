import React from 'react';
import Modal from 'react-native-modal';

const GenericModal = ({
  onClose,
  visible,
  children,
  position = 'flex-end',
}: {
  onClose: any;
  visible: boolean;
  children: any;
  position?: 'flex-end' | 'center';
}) => {
  return (
    <Modal
      avoidKeyboard={true}
      onSwipeComplete={onClose}
      swipeDirection="down"
      backdropTransitionOutTiming={200}
      backdropTransitionInTiming={200}
      animationInTiming={200}
      animationOutTiming={200}
      style={{
        margin: 0,
        flex: 1,
        justifyContent: position,
        alignItems: 'center',
        maxHeight: '100%',
      }}
      hideModalContentWhileAnimating={true}
      onBackButtonPress={onClose}
      isVisible={visible}
      onBackdropPress={onClose}>
      {children}
    </Modal>
  );
};

export default GenericModal;
