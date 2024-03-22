import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
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
    height: 60,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: PortSpacing.tertiary.uniform,
  },
});
export default Disconnected;
