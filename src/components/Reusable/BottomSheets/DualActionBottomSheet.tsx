import React, {useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';

import BaseBottomSheet from '@components/BaseBottomsheet';
import { useColors } from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import LineSeparator from '@components/Separators/LineSeparator';
import { Spacing , Width } from '@components/spacingGuide';

function DualActionBottomSheet({
  showMore,
  openModal,
  title,
  topButton,
  middleButton,
  topButtonFunction,
  middleButtonFunction,
  onClose,
}: {
  showMore: boolean;
  openModal: boolean;
  title: string;
  topButton: string;
  middleButton?: string;
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
        </View>
        <Pressable style={styles.topButtonContainer} onPress={onTopButtonClick}>
          {topButtonLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size={'small'} color={'white'} />
            </View>
          ) : (
            <NumberlessText
              style={styles.topButtonText}
              fontSizeType={FontSizeType.m}
              fontWeight={FontWeight.sb}>
              {topButton}
            </NumberlessText>
          )}
        </Pressable>
        {showMore && (
          <Pressable
            style={styles.bottomButtonContainer}
            onPress={onMiddleButtonClick}>
            {middleButtonLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size={'small'} color={'black'} />
              </View>
            ) : (
              <NumberlessText
                style={styles.bottomButtonText}
                fontSizeType={FontSizeType.m}
                fontWeight={FontWeight.sb}>
                {middleButton}
              </NumberlessText>
            )}
          </Pressable>
        )}
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
    loader: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topButtonContainer: {
      width: '100%',
      backgroundColor: colors.red,
      borderRadius: 12,
      marginBottom: 10,
      height: 50,
      justifyContent: 'center',
    },
    bottomButtonContainer: {
      width: '100%',
      borderWidth: 1,
      borderColor: colors.stroke,
      borderRadius: 12,
      marginBottom: 10,
      height: 50,
      justifyContent: 'center',
    },
    bottomButtonText: {
      color: colors.text.title,
      textAlign: 'center',
    },
    topButtonText: {
      color: 'white',
      textAlign: 'center',
    },
  });

export default DualActionBottomSheet;
