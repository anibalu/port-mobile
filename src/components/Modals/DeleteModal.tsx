import CrossIcon from '@assets/icons/cross.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {screen} from '../ComponentUtils';
import GenericModal from './GenericModal';
import GenericModalTopBar from './GenericModalTopBar';

function DeleteModal({
  showMore,
  openDeleteModal,
  title,
  topButton,
  middleButton,
  bottomButton,
  topButtonFunction,
  middleButtonFunction,
  bottomButtonFunction,
}: {
  showMore: boolean;
  openDeleteModal: boolean;
  title: string;
  topButton: string;
  middleButton?: string;
  bottomButton: string;
  topButtonFunction: any;
  middleButtonFunction?: any;
  bottomButtonFunction: any;
}) {
  return (
    <GenericModal
      visible={openDeleteModal}
      position="center"
      onClose={bottomButtonFunction}>
      <View style={styles.mainContainer}>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <NumberlessText
            style={styles.titleStyles}
            fontSizeType={FontSizeType.l}
            fontType={FontType.md}>
            {title}
          </NumberlessText>

          <View style={{bottom: 5}}>
            <GenericModalTopBar
              RightOptionalIcon={CrossIcon}
              onBackPress={bottomButtonFunction}
            />
          </View>
        </View>

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
            style={styles.topButtonContainer}
            onPress={middleButtonFunction}>
            <NumberlessText
              style={styles.topButtonText}
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}>
              {middleButton}
            </NumberlessText>
          </Pressable>
        )}

        <Pressable
          style={styles.bottomButtonContainer}
          onPress={bottomButtonFunction}>
          <NumberlessText
            style={styles.bottomButtonText}
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}>
            {bottomButton}
          </NumberlessText>
        </Pressable>
      </View>
    </GenericModal>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    width: screen.width - 40,
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  titleStyles: {
    textAlign: 'center',
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
    backgroundColor: '#547CEF',
    borderRadius: 8,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
  },
  topButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  bottomButtonContainer: {
    width: '100%',
    backgroundColor: '#EBEBEB',
    borderRadius: 8,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
  },
  bottomButtonText: {
    textAlign: 'center',
  },
});

export default DeleteModal;
