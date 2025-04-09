import React from 'react';
import {StyleSheet, View} from 'react-native';

import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import PrimaryButton from '../LongButtons/PrimaryButton';

import PrimaryBottomSheet from './PrimaryBottomSheet';

interface DisabledPermissionProps {
  onClose: () => void;
  visible: boolean;
}

const DisabledPermissionBottomSheet = (props: DisabledPermissionProps) => {
  const Colors = DynamicColors();

  const svgArray = [
    // 1.DisabledPermissionPoster
    {
      assetName: 'DisabledPermissionPoster',
      light: require('@assets/light/icons/DisabledPermissionPoster.svg')
        .default,
      dark: require('@assets/dark/icons/DisabledPermissionPoster.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const Poster = results.DisabledPermissionPoster;
  return (
    <PrimaryBottomSheet
      bgColor="g"
      visible={props.visible}
      showClose={false}
      onClose={props.onClose}
      shouldAutoClose={false}>
      <View style={styles.container}>
        <Poster width={screen.width - 30} />
        <NumberlessText
          style={{marginTop: PortSpacing.tertiary.top}}
          textColor={Colors.text.primary}
          fontSizeType={FontSizeType.xl}
          fontType={FontType.sb}>
          That’s a bold move. Just a heads up!
        </NumberlessText>
        <NumberlessText
          style={{marginVertical: PortSpacing.tertiary.top}}
          textColor={Colors.text.subtitle}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          Since all your chats are added to the default folder by default,
          disabling ‘Show Chats in Home’ will remove them from the Home Screen.
          Please double-check your chats and their associated folders. Don’t
          forget to check your New Port folder as well.
        </NumberlessText>

        <PrimaryButton
          isLoading={false}
          disabled={false}
          primaryButtonColor="b"
          buttonText="Ok, got it!"
          onClick={props.onClose}
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
});

export default DisabledPermissionBottomSheet;
