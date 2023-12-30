import React from 'react';
import Modal from 'react-native-modal';

const GenericModal = ({
  onClose,
  visible,
  children,
  avoidKeyboard = true,
  position = 'flex-end',
}: {
  onClose: any;
  visible: boolean;
  children: any;
  avoidKeyboard?: boolean;
  position?: 'flex-end' | 'center';
}) => {
  return (
    <Modal
      avoidKeyboard={avoidKeyboard}
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
