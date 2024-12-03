import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import {PortSpacing, isIOS} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';

interface PortInfoProps {
  onClose: () => void;
  onClick: () => void;
  visible: boolean;
  buttonText: string;
}

const PortInfoBottomsheet = (props: PortInfoProps) => {
  const Colors = DynamicColors();

  const svgArray = [
    {
      assetName: 'PortInfoBanner',
      light: require('@assets/light/backgrounds/PortInfoBanner.png'),
      dark: require('@assets/dark/backgrounds/PortInfoBanner.png'),
    },
  ];
  const results = useDynamicSVG(svgArray);

  const PortInfoBanner = results.PortInfoBanner;

  return (
    <PrimaryBottomSheet
      bgColor="g"
      visible={props.visible}
      showClose={false}
      onClose={props.onClose}
      shouldAutoClose={false}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <ImageBackground
            source={PortInfoBanner}
            style={StyleSheet.compose(styles.background, {
              backgroundColor: Colors.primary.surface,
            })}
          />
        </View>
        <NumberlessText
          style={{marginTop: PortSpacing.secondary.top}}
          textColor={Colors.text.primary}
          fontSizeType={FontSizeType.xl}
          fontType={FontType.sb}>
          What is a Port?
        </NumberlessText>
        <NumberlessText
          style={{
            marginTop: PortSpacing.tertiary.top,
            marginBottom: PortSpacing.secondary.bottom,
          }}
          textColor={Colors.text.subtitle}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          A Port is a one-time use QR or link that is shared to form a new
          connection. {'\n\n'}A Port - unlike contact info - is not a unique
          identifier for you. Once a connection forms, the Port and the
          information it contains is unusable.
        </NumberlessText>

        <PrimaryButton
          isLoading={false}
          disabled={false}
          primaryButtonColor="b"
          buttonText={props.buttonText}
          onClick={props.onClick}
        />
      </View>
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
  },
  imageContainer: {
    height: 253,
    borderRadius: PortSpacing.tertiary.uniform,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    width: '100%',
    height: 253,
    position: 'absolute',
    resizeMode: 'cover',
  },
});

export default PortInfoBottomsheet;
