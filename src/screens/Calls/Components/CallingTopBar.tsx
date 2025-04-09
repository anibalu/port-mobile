import {PortSpacing, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {TOPBAR_HEIGHT} from '@configs/constants';
import React from 'react';
import {StyleSheet,View} from 'react-native';
import {CallState, CallUIState} from '../OngoingCall';
import MicrophoneOn from '@assets/dark/icons/MicOn.svg';

const CallingTopBar = ({
  heading,
  callState,
  callUIState,
}: {
  heading: string;
  callState: CallState;
  callUIState: CallUIState;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <View style={styles.topbarAcontainer}>
      <View style={styles.nameAndTime}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
          <NumberlessText
            style={{textAlign: 'center'}}
            numberOfLines={1}
            textColor={Colors.primary.white}
            ellipsizeMode="tail"
            fontType={FontType.sb}
            fontSizeType={FontSizeType.l}>
            {heading}
          </NumberlessText>
          {!callUIState.peerMic && <MicrophoneOn width={16} height={16} />}
        </View>
        <NumberlessText
          style={{textAlign: 'center', marginTop: 4}}
          numberOfLines={1}
          textColor={Colors.primary.white}
          ellipsizeMode="tail"
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          {callState === CallState.active ? 'active' : 'connecting...'}
        </NumberlessText>
      </View>
    </View>
  );
};

const styling = (_colors: any) =>
  StyleSheet.create({
    topbarAcontainer: {
      flexDirection: 'column',
      paddingHorizontal: PortSpacing.secondary.uniform,
      alignItems: 'center',
      height: TOPBAR_HEIGHT,
      justifyContent: 'center',
      width: screen.width,
      position: 'absolute',
      top: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    nameAndTime: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default CallingTopBar;
