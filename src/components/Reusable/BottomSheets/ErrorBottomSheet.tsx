import React from 'react';
import {StyleSheet, View} from 'react-native';

import SecondaryButton from '@components/Buttons/SecondaryButton';
import {useColors} from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import LineSeparator from '@components/Separators/LineSeparator';
import {Size, Spacing, Width} from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

import AlertIcon from '@assets/icons/ErrorAlert.svg';

import PrimaryBottomSheet from './PrimaryBottomSheet';

/**
 * A bottom sheet component that displays an error message and a button to try again.
 * @param visible - Whether the bottom sheet is visible.
 * @param title - The title of the error.
 * @param description - The description of the error.
 * @param onClose - The function to call when the bottom sheet is closed.
 * @param onTryAgain - The function to call when the button is pressed.
 * @param forceTheme - The theme to use for the bottom sheet.
 */
const ErrorBottomSheet = ({
  visible,
  title,
  description,
  onClose,
  onTryAgain,
  forceTheme,
}: {
  visible: boolean;
  onClose: () => void;
  onTryAgain?: () => Promise<void>;
  description: string;
  title: string;
  forceTheme?: 'light' | 'dark';
}) => {
  const Colors = useColors(forceTheme);

  const svgArray = [
    {
      assetName: 'Retry',
      light: require('@assets/light/icons/Retry.svg').default,
      dark: require('@assets/dark/icons/Retry.svg').default,
    },
  ];

  const results = useSVG(svgArray);
  const Retry = results.Retry;

  return (
    <PrimaryBottomSheet
      showClose={false}
      showNotch={false}
      visible={visible}
      onClose={onClose}>
      <View style={styles.connectionOptionsRegion}>
        <View style={styles.mainContainer}>
          <View style={styles.titleContainer}>
            <AlertIcon width={Size.l} height={Size.l} />
            <NumberlessText
              textColor={Colors.red}
              fontSizeType={FontSizeType.xl}
              fontWeight={FontWeight.sb}>
              {title}
            </NumberlessText>
          </View>
          <LineSeparator style={{width: Width.screen}} />
        </View>
      </View>
      <View style={styles.mainWrapper}>
        <NumberlessText
          textColor={Colors.text.subtitle}
          fontSizeType={FontSizeType.m}
          fontWeight={FontWeight.rg}>
          {description}
        </NumberlessText>
        {onTryAgain && (
          <SecondaryButton
            text={'Try Again'}
            color={Colors.black}
            theme={Colors.theme}
            Icon={Retry}
            onClick={onTryAgain}
            isLoading={false}
            disabled={false}
          />
        )}
      </View>
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  connectionOptionsRegion: {
    width: Width.screen,
    paddingHorizontal: Spacing.l,
  },
  mainContainer: {
    width: '100%',
    paddingTop: Spacing.s,
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.m,
  },
  mainWrapper: {
    width: Width.screen,
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.l,
    gap: Spacing.l,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
  },
});

export default ErrorBottomSheet;
