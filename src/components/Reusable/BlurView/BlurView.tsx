import {TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import React from 'react';
import {PortSpacing, screen} from '@components/ComponentUtils';

const BlurViewModal = ({
  onClose,
  children,
  visible,
  elementPositionY = 200,
}: {
  onClose: () => void;
  children?: any;
  visible: boolean;
  elementPositionY?: any;
}) => {
  const adjustedPositionY = elementPositionY;

  return (
    <Modal
      backdropTransitionInTiming={0.1}
      backdropTransitionOutTiming={0.1}
      hideModalContentWhileAnimating={false}
      animationInTiming={0.1}
      animationOutTiming={0.1}
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}
      backdropOpacity={0.8}
      isVisible={visible}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          left: -PortSpacing.secondary.left - 4,
        }}>
        <View
          style={{
            height: screen.height,
            width: screen.width,
          }}>
          <View
            style={{
              position: 'absolute',
              top: adjustedPositionY,
            }}>
            {children}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default BlurViewModal;
