/**
 * This bottomsheet shows an loading icon left with title and footer branding
 * App Instances ex: 'creating one time link'
 * Takes the following props:
 * 1. visible state for bottomsheet
 * 2. onClose function (runs on right 'x' and modal backdrop click)
 * 3. title text for bottomsheet header
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

import BrandLogo from '@assets/icons/BrandLogo.svg';
import BrandName from '@assets/icons/BrandName.svg';

import PrimaryBottomSheet from './PrimaryBottomSheet';

const CreatingLinkBottomSheet = ({
  visible,
  title,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
}) => {
  return (
    <PrimaryBottomSheet
      showClose={false}
      showLoaderIconLeft={true}
      customIconLeft={true}
      visible={visible}
      title={title}
      titleStyle={styles.title}
      onClose={onClose}>
      <View style={styles.mainWrapper}>
        <View style={styles.footerWrapper}>
          <NumberlessText
            style={{
              color: PortColors.subtitle,
              marginRight: PortSpacing.tertiary.right,
            }}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            Powered by
          </NumberlessText>
          <View style={{marginRight: 4}}>
            <BrandLogo width={16} height={16} />
          </View>
          <BrandName width={34} height={11} />
        </View>
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
    fontFamily: FontType.rg,
    fontSize: FontSizeType.l,
    fontWeight: getWeight(FontType.rg),
    color: PortColors.title,
    marginLeft: PortSpacing.tertiary.left,
  },
  footerWrapper: {
    marginBottom: PortSpacing.tertiary.bottom,
    marginTop: PortSpacing.secondary.top,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CreatingLinkBottomSheet;
