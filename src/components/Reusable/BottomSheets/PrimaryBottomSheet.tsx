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

const PrimaryBottomSheet = ({
  visible,
  showNotch = false,
  avoidKeyboard = true,
  showClose = true,
  onClose = () => {},
  title,
  titleStyle,
  LeftIconOnClick,
  IconLeft,
  children,
}: {
  visible: boolean;
  showNotch?: boolean;
  avoidKeyboard?: boolean;
  showClose: boolean;
  onClose?: () => void;
  title?: string;
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
        style={StyleSheet.compose(
          styles.mainContainerRegion,
          showNotch && {paddingTop: 8},
        )}>
        {showNotch && <View style={styles.topnotch} />}
        <View style={styles.topRow}>
          <View style={styles.leftContainer}>
            {IconLeft && (
              <Pressable onPress={LeftIconOnClick}>
                <IconLeft width={24} height={24} />
              </Pressable>
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
    backgroundColor: PortColors.primary.grey.light,
    flexDirection: 'column',
    width: screen.width,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderTopRightRadius: PortSpacing.intermediate.right,
    borderTopLeftRadius: PortSpacing.intermediate.left,
    padding: PortSpacing.secondary.uniform,
    paddingTop: PortSpacing.intermediate.top,
    ...(isIOS ? {paddingBottom: PortSpacing.secondary.bottom} : 0),
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  topnotch: {
    alignSelf: 'center',
    width: 90,
    height: 6,
    borderRadius: 8,
    backgroundColor: PortColors.primary.notch,
  },
  titleText: {
    fontFamily: FontType.md,
    fontSize: FontSizeType.l,
    fontWeight: getWeight(FontType.md),
    color: PortColors.text.primary,
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

export default PrimaryBottomSheet;
