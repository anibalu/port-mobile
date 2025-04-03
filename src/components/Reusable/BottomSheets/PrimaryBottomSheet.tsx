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
import {isIOS, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import SmallLoader from '../Loaders/SmallLoader';
import useSVG from '@components/svgGuide';
import {useColors} from '@components/colorGuide';
import {Size, Spacing, Width} from '@components/spacingGuide';

/**
 * A reusable bottom sheet component that provides consistent behavior and styling.
 * Features:
 * - Optional notch indicator at top
 * - Customizable header with title and left icon
 * - Support for keyboard avoidance
 * - Close button with custom handling
 * - Loading state for left icon
 * - Theme-aware styling with optional theme forcing
 * - Configurable background color (white or grey)
 * - Auto-close behavior when app goes to background (configurable)
 *
 * @param visible - Controls visibility of bottom sheet
 * @param showNotch - Show notch indicator at top
 * @param avoidKeyboard - Whether sheet adjusts for keyboard
 * @param showClose - Show close button in header
 * @param onClose - Function called when sheet closes
 * @param title - Title text shown in header
 * @param titleStyle - Custom styles for title text
 * @param IconLeft - Custom icon component for left side
 * @param IconLeftSize - Size of left icon ('s' or 'm')
 * @param LeftIconOnClick - Click handler for left icon
 * @param showLoaderIconLeft - Show loading indicator instead of left icon
 * @param bgColor - Background color ('w' for white, 'g' for grey)
 * @param shouldAutoClose - Auto-close when app backgrounds
 * @param forceTheme - Override app theme
 * @param children - Content of the bottom sheet
 */

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
  bgColor = 'w',
  shouldAutoClose = true,
  forceTheme,
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
  IconLeftSize?: 's' | 'm';
  titleStyle?: TextStyle | StyleProp<TextStyle>;
  LeftIconOnClick?: () => void;
  IconLeft?: FC<SvgProps>;
  shouldAutoClose?: boolean;
  children: any;
  forceTheme?: 'light' | 'dark';
}) => {
  const neatClose = () => {
    Keyboard.dismiss();
    onClose();
  };
  const Colors = useColors(forceTheme);

  const svgArray = [
    {
      assetName: 'CloseIcon',
      light: require('@assets/light/icons/Close.svg').default,
      dark: require('@assets/dark/icons/Close.svg').default,
    },
  ];

  const results = useSVG(svgArray, forceTheme);
  const CloseIcon = results.CloseIcon;
  const styles = styling(Colors);

  return (
    <GenericModal
      avoidKeyboard={avoidKeyboard}
      visible={visible}
      onClose={neatClose}
      shouldAutoClose={shouldAutoClose}
      forceTheme={forceTheme}>
      <View
        style={StyleSheet.compose(styles.mainContainerRegion, {
          backgroundColor: bgColor === 'g' ? Colors.background : Colors.surface,
          paddingTop: showNotch ? Spacing.s : Spacing.m,
        })}>
        {showNotch && <View style={styles.topnotch} />}
        <View style={styles.topRow}>
          <View style={styles.leftContainer}>
            {IconLeft && (
              <Pressable onPress={LeftIconOnClick}>
                <IconLeft
                  width={IconLeftSize === 's' ? Size.m : Size.l}
                  height={IconLeftSize === 's' ? Size.m : Size.l}
                />
              </Pressable>
            )}
            {showLoaderIconLeft && (
              <View>
                <SmallLoader theme={Colors.theme} />
              </View>
            )}
            {title && (
              <NumberlessText
                style={StyleSheet.compose(styles.title, titleStyle)}
                fontWeight={FontWeight.md}
                fontSizeType={FontSizeType.l}
                textColor={Colors.text.title}>
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
                fontWeight={FontWeight.md}
                fontSizeType={FontSizeType.l}
                textColor={Colors.text.title}>
                {' '}
              </NumberlessText>
              <CloseIcon
                width={Size.l}
                height={Size.l}
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

const styling = (Colors: any) =>
  StyleSheet.create({
    mainContainerRegion: {
      flexDirection: 'column',
      width: screen.width,
      justifyContent: 'flex-start',
      alignItems: 'center',
      borderTopRightRadius: Spacing.xl,
      borderTopLeftRadius: Spacing.xl,
      padding: Spacing.xl,
      ...(isIOS ? {paddingBottom: Spacing.xl} : 0),
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
      backgroundColor: Colors.notch,
    },
    title: {
      maxWidth: Width.screen - 52,
      height: '100%',
      flex: 1,
    },
    topRow: {
      overflow: 'hidden',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
  });

export default PrimaryBottomSheet;
