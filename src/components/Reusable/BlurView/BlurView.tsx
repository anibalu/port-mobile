import {TouchableOpacity, View} from 'react-native';
import React from 'react';
import {screen} from '@components/ComponentUtils';
import {useChatContext} from '@screens/DirectChat/ChatContext';

const BlurViewModal = () => {
  const {onCleanCloseFocus, visible, elementPositionY, childElement} =
    useChatContext();

  return (
    visible && (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onCleanCloseFocus}
        style={{
          position: 'absolute',
          height: screen.height,
          width: screen.width,
          bottom: 0,
          right: 0,
          backgroundColor: '#000000BF',
        }}>
        <View
          style={{
            height: screen.height,
            width: screen.width,
          }}>
          <View
            style={{
              position: 'absolute',
              top: elementPositionY,
            }}>
            {childElement}
          </View>
        </View>
      </TouchableOpacity>
    )
  );
};

export default BlurViewModal;
