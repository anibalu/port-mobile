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
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SmallLoader from '../Loaders/SmallLoader';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

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
  const Colors = DynamicColors();

  const svgArray = [
    {
      assetName: 'CloseIcon',
      light: require('@assets/light/icons/Close.svg').default,
      dark: require('@assets/dark/icons/Close.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const CloseIcon = results.CloseIcon;

  return (
    <GenericModal
      avoidKeyboard={avoidKeyboard}
      visible={visible}
      onClose={neatClose}>
      <View
        style={StyleSheet.compose(styles.mainContainerRegion, {
          backgroundColor:
            bgColor === 'g'
              ? Colors.primary.background
              : Colors.primary.surface,
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
              <NumberlessText
                style={StyleSheet.compose(styles.title, titleStyle)}
                fontType={FontType.md}
                fontSizeType={FontSizeType.l}
                textColor={Colors.text.primary}>
                {title}
              </NumberlessText>
            )}
          </View>
          {showClose && (
            <Pressable
              onPress={neatClose}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
              <NumberlessText
                numberOfLines={1}
                style={StyleSheet.compose(styles.title, titleStyle)}
                fontType={FontType.md}
                fontSizeType={FontSizeType.l}
                textColor={Colors.text.primary}>
                {' '}
              </NumberlessText>
              <CloseIcon
                width={24}
                height={24}
                style={{position: 'absolute'}}
              />
            </Pressable>
          )}
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
  title: {
    maxWidth: screen.width - 52,
    height: '100%',
    flex: 1,
  },
  backButton: {
    padding: 3,
    borderRadius: 24,
    backgroundColor: 'none',
  },
  topRow: {
    overflow: 'hidden',
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
