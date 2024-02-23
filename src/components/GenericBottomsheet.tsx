import React from 'react';
import {PortColors, screen} from './ComponentUtils';
import GenericModal from './GenericModal';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';
import {StyleSheet, View} from 'react-native';
import {GenericButton} from './GenericButton';
import Whitecross from '@assets/icons/WhitecrossOutline.svg';
import BackButton from '@assets/icons/BlackArrowLeft.svg';
import {useNavigation} from '@react-navigation/native';

const GenericBottomsheet = ({
  onClose,
  visible,
  children,
  headerTile,
  titleColor,
  showNotch = false,
  avoidKeyboard = true,
  showBackButton = false,
  showCloseButton = false,
}: {
  onClose: any;
  visible: boolean;
  children: any;
  titleColor?: string;
  showNotch?: boolean;
  headerTile?: string;
  avoidKeyboard?: boolean;
  showBackButton?: boolean;
  showCloseButton?: boolean;
}) => {
  const navigation = useNavigation();

  return (
    <GenericModal
      avoidKeyboard={avoidKeyboard}
      visible={visible}
      onClose={onClose}>
      <View
        style={StyleSheet.compose(
          styles.mainContainerRegion,
          showNotch && {paddingTop: 8},
        )}>
        {showNotch && <View style={styles.topnotch} />}
        <View style={styles.topRow}>
          {showBackButton && (
            <GenericButton
              buttonStyle={styles.backButton}
              IconLeft={BackButton}
              iconSize={14}
              onPress={() => navigation.goBack()}
            />
          )}
          {headerTile && (
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}
              textColor={titleColor ? titleColor : PortColors.text.primary}>
              {headerTile}
            </NumberlessText>
          )}
          {showCloseButton && (
            <GenericButton
              buttonStyle={styles.closeButton}
              IconLeft={Whitecross}
              iconSize={16}
              onPress={onClose}
            />
          )}
        </View>
        {children}
      </View>
    </GenericModal>
  );
};

const styles = StyleSheet.create({
  mainContainerRegion: {
    backgroundColor: PortColors.primary.grey.light,
    flexDirection: 'column',
    gap: 20,
    width: screen.width,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    padding: 24,
  },
  topnotch: {
    alignSelf: 'center',
    width: 90,
    height: 6,
    borderRadius: 8,
    backgroundColor: PortColors.primary.notch,
  },
  backButton: {
    padding: 3,
    borderRadius: 24,
    backgroundColor: 'none',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 3,
    borderRadius: 24,
    backgroundColor: PortColors.primary.grey.medium,
  },
});

export default GenericBottomsheet;
