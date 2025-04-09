import React from 'react';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {StyleSheet, TouchableOpacity,View} from 'react-native';
import {Height, Size, Spacing} from '@components/spacingGuide';
import {useThemeColors} from '@components/colorGuide';
import {PermissionConfig} from '@components/getPermissionIcon';
import RightChevronBlue from '@assets/dark/icons/navigation/AngleRightBlue.svg';

const NumberPermissionOption = ({
  onClick,
  permissionState,
  title,
  PermissionConfigMap,
  labelText,
  theme,
}: {
  onClick: () => void;
  permissionState: number;
  title: string;
  PermissionConfigMap: PermissionConfig;
  labelText: string;
  theme: 'light' | 'dark';
}) => {
  const colors = useThemeColors(theme);

  return (
    <TouchableOpacity
      onPress={onClick}
      style={styles.optionWrapper}
      activeOpacity={0.6}>
      <View style={styles.topContainer}>
        <View
          style={{
            backgroundColor: permissionState
              ? PermissionConfigMap.bgColor
              : 'transparent',
            borderWidth: 0.5,
            borderRadius: 100,
            padding: Spacing.s,
            borderColor: permissionState ? 'transparent' : colors.stroke,
          }}>
          {permissionState ? (
            <PermissionConfigMap.enabledIcon height={Size.m} width={Size.m} />
          ) : theme === 'light' ? (
            <PermissionConfigMap.disabledIconLight
              height={Size.m}
              width={Size.m}
            />
          ) : (
            <PermissionConfigMap.disabledIconDark
              height={Size.m}
              width={Size.m}
            />
          )}
        </View>
        <NumberlessText
          textColor={colors.text.title}
          numberOfLines={1}
          ellipsizeMode={'tail'}
          fontSizeType={FontSizeType.m}
          fontWeight={FontWeight.rg}
          style={styles.heading}>
          {title}
        </NumberlessText>
        <View
          style={{
            ...styles.labelWrapper,
            backgroundColor: PermissionConfigMap.bgColor,
          }}>
          <NumberlessText
            fontWeight={FontWeight.md}
            fontSizeType={FontSizeType.s}
            textColor={colors.boldAccentColors.blue}>
            {labelText}
          </NumberlessText>
          <RightChevronBlue width={Size.m} height={Size.m} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    height: Height.optionBar,
  },
  labelWrapper: {
    borderRadius: 40,
    paddingLeft: Spacing.m,
    paddingRight: Spacing.s,
    gap: Spacing.xs,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    height: Height.label,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  heading: {
    marginHorizontal: Spacing.s,
    flex: 1,
  },
});

export default NumberPermissionOption;
