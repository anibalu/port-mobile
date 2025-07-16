import React from 'react';
import {StyleSheet, View} from 'react-native';


import { useColors } from '@components/colorGuide';
import {Spacing, Width} from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

import Hint from '@assets/icons/Hint.svg';
import Error from '@assets/icons/InfoRed.svg';
import Success from '@assets/icons/SuccessTick.svg';
import Warning from '@assets/icons/Warning.svg';

import {ToastType, useToast} from 'src/context/ToastContext';

import {FontSizeType, FontWeight, NumberlessText} from '../NumberlessText';

function Toast() {
  const {isToastVisible, toastToShow, setIsToastVisible} = useToast();
  const {text, type} = toastToShow;
  const Colors = useColors();
  const styles= styling(Colors)
  const svgArray = [
    {
      assetName: 'Cross',
      light: require('@assets/light/icons/CrossWhite.svg').default,
      dark: require('@assets/dark/icons/Cross.svg').default,
    },
  ];
  const results = useSVG(svgArray);
  const Cross = results.Cross;

  return (
    <>
    
      {isToastVisible && (
        <View
          style={StyleSheet.compose(
            styles.modalView,
            type === ToastType.success
              ? styles.successModalView
              :type ===ToastType.warning? styles.warningModalView: type===ToastType.error? styles.errorModalView: styles.hintModalView,
          )}>
            <View style={styles.iconView}>
            {type === ToastType.success ? <Success /> : type ===ToastType.warning? <Warning />: type===ToastType.error?<Error />: <Hint/>}
          <Cross hitSlop={40} onPress={()=>setIsToastVisible(false)} />
            </View>
         
          <NumberlessText
          textColor={Colors.text.title}
            fontWeight={FontWeight.md}
            fontSizeType={FontSizeType.m}
            style={styles.modaltext}>
            {type === ToastType.success ? 'Success' : type ===ToastType.warning? 'Warning': type===ToastType.error?'Error':'Hint'}
          </NumberlessText>
          <NumberlessText
            textColor={Colors.text.subtitle}
            fontWeight={FontWeight.rg}
            fontSizeType={FontSizeType.s}
            style={styles.subText}>
            {text}
          </NumberlessText>
        </View> 
      )}
    </>
  );
}

const styling =(Colors: any, )=> StyleSheet.create({
  modalView: {
    justifyContent: 'center',
    width: Width.screen - 40,
    zIndex: 99,
    bottom: 100,
    borderRadius: 10,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    position: 'absolute',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.red,
  },
  iconView:{
    flexDirection:'row',
    justifyContent:'space-between'
  },
  successModalView: {
    backgroundColor: Colors.theme === 'dark'? '#17331F' : '#D9F5E7',
    borderColor: 'rgba(18, 183, 106, 0.50)',
    borderBottomWidth: 4
  },
  errorModalView: {
    backgroundColor: Colors.theme === 'dark'? '#341A14' : '#FDE8E6',
    borderColor: 'rgba(239, 77, 65, 0.50)',
    borderBottomWidth: 4
  },
  warningModalView:{
    backgroundColor: Colors.theme === 'dark'? '#331F06' : '#F4E0CC',
    borderColor: 'rgba(249, 149, 32, 0.50)',
    borderBottomWidth: 4
  },
  hintModalView:{
    backgroundColor: Colors.theme === 'dark'? '#1C243C' : '#DAE0F9',
    borderColor: 'rgba(122, 152, 255, 0.50)',
    borderBottomWidth: 4
  },
  modaltext: {
    textAlign: 'left',
    lineHeight: 15,
    marginTop: Spacing.m
  },
  subText:{
    textAlign: 'left',
    lineHeight: 15,
    marginTop: Spacing.xs
  }
});
export default Toast;
