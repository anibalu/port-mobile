import React from 'react';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {Pressable, StyleSheet, View} from 'react-native';
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import PrimaryBottomSheet from './PrimaryBottomSheet';

function PopupBottomsheet({
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
  return (
    <PrimaryBottomSheet
      visible={openModal}
      showClose
      title={title}
      onClose={onClose}>
      <View style={styles.mainContainer}>
        <Pressable
          style={styles.topButtonContainer}
          onPress={topButtonFunction}>
          <NumberlessText
            style={styles.topButtonText}
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}>
            {topButton}
          </NumberlessText>
        </Pressable>
        {showMore && (
          <Pressable
            style={styles.bottomButtonContainer}
            onPress={middleButtonFunction}>
            <NumberlessText
              style={styles.bottomButtonText}
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}>
              {middleButton}
            </NumberlessText>
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

export default PopupBottomsheet;
