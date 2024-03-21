import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {SvgProps} from 'react-native-svg';

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
  return (
    <TouchableOpacity
      onPress={onClick}
      accessibilityIgnoresInvertColors
      style={{
        paddingHorizontal: PortSpacing.secondary.uniform,
        backgroundColor: isSelected ? PortColors.stroke : 'transparent',
      }}
      activeOpacity={0.6}>
      <View style={styles.listItem}>
        {isSelected && <View style={styles.selectedOptionIndicator} />}
        <IconLeft width={20} height={20} />
        <View style={styles.listContentWrapper}>
          <NumberlessText
            style={{color: PortColors.primary.black}}
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
                  ? PortColors.primary.blue.app
                  : 'transparent',
              },
            )}>
            <NumberlessText
              style={{
                color: isBadgeFilled
                  ? PortColors.primary.white
                  : PortColors.primary.blue.app,
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

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 12,
    borderRadius: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomColor: PortColors.stroke,
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
    backgroundColor: PortColors.primary.blue.app,
  },
});

export default FolderDrawerOption;
