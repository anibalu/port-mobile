import React from 'react';
import {StyleSheet, View} from 'react-native';
import {PortColors, PortSpacing, screen} from '../ComponentUtils';
import {FontSizeType, FontType, NumberlessText} from '../NumberlessText';
import Error from '@assets/icons/InfoRed.svg';
import Success from '@assets/icons/SuccessTick.svg';
import {ToastType, useToast} from 'src/context/ToastContext';

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
            fontType={FontType.rg}
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
    maxWidth: screen.width - 70,
    width: 'auto',
    bottom: 100,
    borderRadius: 10,
    padding: PortSpacing.tertiary.uniform,
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
    marginLeft: 6,
    textAlign: 'left',
    lineHeight: 15,
    paddingTop: 3,
  },
});
export default Toast;
