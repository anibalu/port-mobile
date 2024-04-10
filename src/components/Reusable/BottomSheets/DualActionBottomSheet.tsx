import React, {useState} from 'react';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import PrimaryBottomSheet from './PrimaryBottomSheet';

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

  return (
    <PrimaryBottomSheet
      visible={openModal}
      showClose
      title={title}
      onClose={onClose}>
      <View style={styles.mainContainer}>
        <Pressable style={styles.topButtonContainer} onPress={onTopButtonClick}>
          {topButtonLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size={'small'} color={'white'} />
            </View>
          ) : (
            <NumberlessText
              style={styles.topButtonText}
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}>
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
                fontType={FontType.md}>
                {middleButton}
              </NumberlessText>
            )}
          </Pressable>
        )}
      </View>
    </PrimaryBottomSheet>
  );
}
const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    width: screen.width,
    paddingTop: PortSpacing.secondary.uniform,
    paddingHorizontal: PortSpacing.secondary.uniform,
    borderRadius: 30,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleStyles: {
    textAlign: 'left',
    marginBottom: 20,
    width: '100%',
  },
  questionStyles: {
    textAlign: 'left',
    marginBottom: 10,
  },
  descriptionStyles: {
    color: '#606060',
    textAlign: 'left',
    marginBottom: 30,
  },
  topButtonContainer: {
    width: '100%',
    backgroundColor: PortColors.primary.red.error,
    borderRadius: 12,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
  },
  bottomButtonContainer: {
    width: '100%',
    backgroundColor: PortColors.primary.white,
    borderRadius: 12,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
  },
  bottomButtonText: {
    color: PortColors.primary.red.error,
    textAlign: 'center',
  },
  topButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default DualActionBottomSheet;
