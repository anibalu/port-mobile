import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {BOTTOMBAR_HEIGHT} from '@configs/constants';
import React from 'react';
import {StyleSheet, View} from 'react-native';

const Disconnected = ({name}: {name: string}) => {
  return (
    <View style={styles.main}>
      <NumberlessText
        textColor={PortColors.primary.black}
        fontSizeType={FontSizeType.s}
        fontType={FontType.rg}>
        You can no longer send messages as you and {name} are disconnected
      </NumberlessText>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: PortColors.primary.grey.medium,
    height: BOTTOMBAR_HEIGHT,
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
