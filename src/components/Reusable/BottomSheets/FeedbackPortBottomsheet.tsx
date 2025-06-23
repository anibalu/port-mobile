import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import BaseBottomSheet from '@components/BaseBottomsheet';
import PrimaryButton from '@components/Buttons/PrimaryButton';
import SecondaryButton from '@components/Buttons/SecondaryButton';
import { useColors } from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import LineSeparator from '@components/Separators/LineSeparator';
import { Spacing , Width } from '@components/spacingGuide';

function FeedbackPortBottomsheet({
  openModal,
  title,
  body,
  topButton,
  middleButton,
  topButtonFunction,
  middleButtonFunction,
  onClose,
}: {
  openModal: boolean;
  title: string;
  body: string;
  topButton: string;
  middleButton: string;
  topButtonFunction: any;
  middleButtonFunction?: any;
  onClose?: any;
}) {
  const [topButtonLoading, setTopButtonLoading] = useState<boolean>(false);
  const [middleButtonLoading, setMiddleButtonLoading] =
    useState<boolean>(false);

  const onTopButtonClick = async () => {
    setTopButtonLoading(true);
    await topButtonFunction();
    setTopButtonLoading(false);
  };

  const onMiddleButtonClick = async () => {
    setMiddleButtonLoading(true);
    await middleButtonFunction();
    setMiddleButtonLoading(false);
  };

  const Colors = useColors();
  const styles = styling(Colors);
  return (
    <BaseBottomSheet
      visible={openModal}
      onClose={onClose}>
      <View style={styles.mainContainer}>
        <View style={styles.titleContainer}>
          <NumberlessText
            textColor={Colors.text.title}
            fontSizeType={FontSizeType.xl}
            fontWeight={FontWeight.sb}>
            {title}
          </NumberlessText>
          <LineSeparator style={{ width: Width.screen }} />
          <NumberlessText
            textColor={Colors.text.subtitle}
          >
            {body}
          </NumberlessText>
        </View>
        <PrimaryButton
        theme={Colors.theme}
        onClick={onTopButtonClick}
        text={topButton}
        isLoading={topButtonLoading}
        disabled={topButtonLoading || middleButtonLoading}
        buttonStyle={styles.topButtonContainer}
        >
        </PrimaryButton>
        <SecondaryButton
        theme={Colors.theme}
        onClick={onMiddleButtonClick}
        text={middleButton}
        isLoading={middleButtonLoading}
        disabled={topButtonLoading || middleButtonLoading}
        >
        </SecondaryButton>
      </View>
    </BaseBottomSheet>
  );
}
const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      width: Width.screen,
      paddingHorizontal: Spacing.l,
    },
    titleContainer: {
      width: '100%',
      paddingTop: Spacing.s,
      paddingBottom: Spacing.l,
      flexDirection: 'column',
      alignItems: 'center',
      gap: Spacing.m,
    },
    topButtonContainer: {
      backgroundColor: colors.purple,
      marginBottom: 10,
    },
  });

export default FeedbackPortBottomsheet;
