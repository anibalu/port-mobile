import React from 'react';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {StyleSheet, View} from 'react-native';
import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryButton from '../LongButtons/PrimaryButton';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

interface FavouriteFolderProps {
  onClose: () => void;
  visible: boolean;
}

const FavouriteFolderBottomsheet = (props: FavouriteFolderProps) => {
  const Colors = DynamicColors();

  const svgArray = [
    // 1.FavouriteFolderPoster
    {
      assetName: 'FavouriteFolderPoster',
      light: require('@assets/light/icons/FavouriteFolderPoster.svg').default,
      dark: require('@assets/dark/icons/FavouriteFolderPoster.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const Poster = results.FavouriteFolderPoster;
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
          Favourite folders
        </NumberlessText>
        <NumberlessText
          style={{marginVertical: PortSpacing.tertiary.top}}
          textColor={Colors.text.subtitle}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.s}>
          Get a summary of the messages you need to catch up on from a favourite
          on your home screen. The summary will only include chats that don't
          already show up in your home screen.
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

export default FavouriteFolderBottomsheet;
