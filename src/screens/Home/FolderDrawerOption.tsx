import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import {useTheme} from 'src/context/ThemeContext';

const FolderDrawerOption = ({
  onClick,
  IconLeft,
  title,
  isSelected = false,
  badge,
  isBadgeFilled = false,
}: {
  onClick: () => void;
  IconLeft: FC<SvgProps>;
  title: string;
  badge: number;
  isSelected: boolean;
  isBadgeFilled?: boolean;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);

  const {themeValue} = useTheme();

  return (
    <TouchableOpacity
      onPress={onClick}
      accessibilityIgnoresInvertColors
      style={{
        paddingHorizontal: PortSpacing.secondary.uniform,
        backgroundColor: isSelected
          ? themeValue === 'light'
            ? Colors.primary.background
            : Colors.primary.surface2
          : 'transparent',
      }}
      activeOpacity={0.6}>
      <View style={styles.listItem}>
        {isSelected && <View style={styles.selectedOptionIndicator} />}
        <IconLeft width={20} height={20} />
        <View style={styles.listContentWrapper}>
          <NumberlessText
            style={{color: Colors.text.primary}}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            {title}
          </NumberlessText>
        </View>
        {badge > 0 && (
          <View
            style={StyleSheet.compose(
              badge > 9 ? styles.badgeWrapper : styles.badgeWrapperSingleDigit,
              {
                backgroundColor: isBadgeFilled
                  ? Colors.primary.accent
                  : 'transparent',
              },
            )}>
            <NumberlessText
              style={{
                color: isBadgeFilled
                  ? Colors.primary.white
                  : Colors.primary.accent,
              }}
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              {badge > 999 ? '999+' : badge}
            </NumberlessText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    listItem: {
      paddingVertical: 12,
      borderRadius: 0,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      borderBottomColor: color.primary.stroke,
    },
    listContentWrapper: {
      marginLeft: PortSpacing.tertiary.left,
      flexDirection: 'row',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    badgeWrapperSingleDigit: {
      borderRadius: 16,
      paddingVertical: 2,
      paddingHorizontal: 4,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeWrapper: {
      borderRadius: 16,
      paddingVertical: 2,
      paddingHorizontal: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedOptionIndicator: {
      width: 5,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      position: 'absolute',
      left: -16,
      top: 0,
      bottom: 0,
      backgroundColor: color.primary.accent,
    },
  });

export default FolderDrawerOption;
