import React from 'react';
import {StyleSheet, View} from 'react-native';

import {PortSpacing, isIOS} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {BOTTOMBAR_HEIGHT} from '@configs/constants';

const Disconnected = ({name}: {name: string}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <View style={styles.main}>
      <NumberlessText
        textColor={Colors.text.primary}
        fontSizeType={FontSizeType.s}
        fontType={FontType.rg}
        style={{textAlign: 'center'}}>
        {`You are no longer part of "${name}" are disconnected.\nTo rejoin "${name}", use a new group Port or get invited again.`}
      </NumberlessText>
    </View>
  );
};

const styling = Colors =>
  StyleSheet.create({
    main: {
      backgroundColor: Colors.primary.surface2,
      height: BOTTOMBAR_HEIGHT + 10,
      justifyContent: 'center',
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: '100%',
      position: 'absolute',
      ...(isIOS ? {bottom: -20} : {bottom: -10}),
      paddingHorizontal: PortSpacing.tertiary.uniform,
      paddingTop: PortSpacing.secondary.top,
    },
  });
export default Disconnected;
