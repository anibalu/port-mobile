import {isIOS, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
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
  const Colors = DynamicColors();
  return (
    <Modal
      backdropColor={Colors.primary.overlay}
      backdropOpacity={0.5}
      avoidKeyboard={avoidKeyboard}
      propagateSwipe={true}
      onSwipeComplete={onClose}
      swipeDirection="down"
      backdropTransitionOutTiming={0}
      backdropTransitionInTiming={300}
      animationInTiming={300}
      animationOutTiming={300}
      style={{
        margin: 0,
        flex: 1,
        // On Android, keyboard pushes up the modal by default. In order to prevent this, we absolutely position the element.
        ...(!avoidKeyboard &&
          !isIOS && {
            position: 'absolute',
            height: screen.height,
          }),
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
