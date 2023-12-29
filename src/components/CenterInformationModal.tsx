import React from 'react';
import Modal from 'react-native-modal';

const CenterInformationModal = ({
  visible,
  children,
  position = 'flex-end',
}: {
  visible: boolean;
  children: any;
  position?: 'flex-end' | 'center';
}) => {
  return (
    <Modal
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}
      backdropTransitionOutTiming={10}
      backdropTransitionInTiming={10}
      animationInTiming={200}
      animationOutTiming={200}
      style={{
        margin: 0,
        flex: 1,
        justifyContent: position,
        alignItems: 'center',
      }}
      hideModalContentWhileAnimating={true}
      isVisible={visible}>
      {children}
    </Modal>
  );
};

export default CenterInformationModal;
