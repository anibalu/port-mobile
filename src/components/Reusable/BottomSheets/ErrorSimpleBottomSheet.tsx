/**
 * A simple error bottom sheet for displaying simple text and description errors.
 * App Instances ex: 'incorrect qr',
 */

import React from 'react';
import {StyleSheet, View} from 'react-native';

import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';

import AlertIcon from '@assets/icons/ErrorAlert.svg';

import PrimaryBottomSheet from './PrimaryBottomSheet';

const ErrorSimpleBottomSheet = ({
  visible,
  title,
  description,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
  description: string;
  title: string;
}) => {
  return (
    <PrimaryBottomSheet
      showClose={true}
      IconLeft={AlertIcon}
      visible={visible}
      IconLeftSize={'s'}
      title={title}
      titleStyle={styles.title}
      onClose={onClose}>
      <View style={styles.mainWrapper}>
        <NumberlessText
          style={styles.description}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          {description}
        </NumberlessText>
      </View>
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flexDirection: 'column',
    width: '100%',
    marginTop: PortSpacing.intermediate.top,
    ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
  },
  title: {
    fontFamily: FontType.md,
    fontSize: FontSizeType.l,
    fontWeight: getWeight(FontType.md),
    marginLeft: PortSpacing.tertiary.left,
    color: PortColors.primary.red.error,
  },
  description: {
    width: '100%',
    color: PortColors.subtitle,
    marginBottom: PortSpacing.intermediate.bottom,
  },
});

export default ErrorSimpleBottomSheet;
