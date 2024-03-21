/**
 * A simple bottom sheet. It is used throughout the app.
 * Takes the following props:
 * 1. visible state for bottomsheet
 * 2. onClose function (runs on right 'x' icon as well)
 * 3. showNotch - whether the notch should be seen
 * 4. title
 * 5. title text style (optional)
 * 6. avoid keyboard - whether the keyboard should push up the sheet
 * 7. left icon
 * 8. left icon on click functoin
 * 9. children
 */

import React, {FC} from 'react';
import {
  Keyboard,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import {SvgProps} from 'react-native-svg';
import GenericModal from '@components/Modals/GenericModal';
import {
  PortColors,
  PortSpacing,
  isIOS,
  screen,
} from '@components/ComponentUtils';
import BlackCross from '@assets/icons/BlackCross.svg';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import SmallLoader from '../Loaders/SmallLoader';

const PrimaryBottomSheet = ({
  visible,
  IconLeftSize,
  showNotch = false,
  avoidKeyboard = true,
  showClose = true,
  onClose = () => {},
  title,
  titleStyle,
  LeftIconOnClick,
  IconLeft,
  children,
  showLoaderIconLeft,
  bgColor,
}: {
  visible: boolean;
  showNotch?: boolean;
  customIconLeft?: any;
  avoidKeyboard?: boolean;
  showLoaderIconLeft?: boolean;
  showClose: boolean;
  onClose?: () => void;
  title?: string;
  bgColor?: 'w' | 'g';
  IconLeftSize?: 's' | 'gm';
  titleStyle?: TextStyle | StyleProp<TextStyle>;
  LeftIconOnClick?: () => void;
  IconLeft?: FC<SvgProps>;
  children: any;
}) => {
  const neatClose = () => {
    Keyboard.dismiss();
    onClose();
  };
  return (
    <GenericModal
      avoidKeyboard={avoidKeyboard}
      visible={visible}
      onClose={neatClose}>
      <View
        style={StyleSheet.compose(styles.mainContainerRegion, {
          backgroundColor:
            bgColor === 'g'
              ? PortColors.primary.grey.light
              : PortColors.primary.white,
          paddingTop: showNotch
            ? PortSpacing.tertiary.top
            : PortSpacing.intermediate.top,
        })}>
        {showNotch && <View style={styles.topnotch} />}
        <View style={styles.topRow}>
          <View style={styles.leftContainer}>
            {IconLeft && (
              <Pressable onPress={LeftIconOnClick}>
                <IconLeft
                  width={IconLeftSize === 's' ? 20 : 24}
                  height={IconLeftSize === 's' ? 20 : 24}
                />
              </Pressable>
            )}
            {showLoaderIconLeft && (
              <View>
                <SmallLoader />
              </View>
            )}
            {title && (
              <Text style={StyleSheet.compose(styles.titleText, titleStyle)}>
                {title}
              </Text>
            )}
          </View>
          <View>
            {showClose && (
              <Pressable onPress={neatClose}>
                <BlackCross width={24} height={24} />
              </Pressable>
            )}
          </View>
        </View>
        {children}
      </View>
    </GenericModal>
  );
};

const styles = StyleSheet.create({
  mainContainerRegion: {
    flexDirection: 'column',
    width: screen.width,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderTopRightRadius: PortSpacing.intermediate.right,
    borderTopLeftRadius: PortSpacing.intermediate.left,
    padding: PortSpacing.secondary.uniform,
    ...(isIOS ? {paddingBottom: PortSpacing.secondary.bottom} : 0),
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  topnotch: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: PortColors.primary.body,
  },
  titleText: {
    fontFamily: FontType.md,
    fontSize: FontSizeType.l,
    fontWeight: getWeight(FontType.md),
    color: PortColors.text.primary,
    maxWidth: screen.width - 52,
  },
  backButton: {
    padding: 3,
    borderRadius: 24,
    backgroundColor: 'none',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 3,
    borderRadius: 24,
    backgroundColor: PortColors.primary.grey.medium,
  },
});

export default PrimaryBottomSheet;
