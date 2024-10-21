import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';

const SuperportCreationStepBadge = ({stepCount}: {stepCount: string}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  return (
    <View style={styles.badgeWrapper}>
      <NumberlessText
        textColor={Colors.text.subtitle}
        fontType={FontType.rg}
        fontSizeType={FontSizeType.m}>
        {stepCount}
      </NumberlessText>
    </View>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    badgeWrapper: {
      backgroundColor: color.primary.surface,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: PortSpacing.secondary.left,
      marginVertical: PortSpacing.secondary.uniform,
      height: 32,
      width: 32,
    },
  });

export default SuperportCreationStepBadge;
