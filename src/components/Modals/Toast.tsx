import React from 'react';
import {StyleSheet, View} from 'react-native';

import {PortColors} from '@components/ComponentUtils';
import {Spacing, Width} from '@components/spacingGuide';

import Error from '@assets/icons/InfoRed.svg';
import Success from '@assets/icons/SuccessTick.svg';

import {ToastType, useToast} from 'src/context/ToastContext';

import {FontSizeType, FontWeight, NumberlessText} from '../NumberlessText';

function Toast() {
  const {isToastVisible, toastToShow} = useToast();
  const {text, type} = toastToShow;

  return (
    <>
      {isToastVisible && (
        <View
          style={StyleSheet.compose(
            styles.modalView,
            type === ToastType.success
              ? styles.successModalView
              : styles.errorModalView,
          )}>
          {type === ToastType.success ? <Success /> : <Error />}
          <NumberlessText
            fontWeight={FontWeight.rg}
            fontSizeType={FontSizeType.s}
            style={styles.modaltext}>
            {text}
          </NumberlessText>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalView: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    maxWidth: Width.screen - 70,
    zIndex: 99,
    width: 'auto',
    bottom: 100,
    borderRadius: 10,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.l,
    position: 'absolute',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: PortColors.primary.red.error,
  },
  successModalView: {
    backgroundColor: '#D9F5E7',
    borderColor: 'rgba(18, 183, 106, 0.50)',
  },
  errorModalView: {
    backgroundColor: '#FDE8E6',
    borderColor: 'rgba(239, 77, 65, 0.50)',
  },
  modaltext: {
    color: PortColors.title,
    marginLeft: 8,
    textAlign: 'left',
    lineHeight: 15,
  },
});
export default Toast;
