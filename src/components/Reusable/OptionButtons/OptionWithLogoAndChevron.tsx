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

const OptionWithLogoAndChevron = ({
  onClick,
  IconLeft,
  IconRight,
  title,
  subtitle,
  theme = null,
  backgroundColor,
}: {
  theme?: 'light' | 'dark' | null;
  onClick: () => void;
  IconLeft?: FC<SvgProps>;
  IconRight?: FC<SvgProps>;
  title?: string;
  subtitle?: string;
  backgroundColor: string;
}) => {
  const Colors = DynamicColors(theme);
  return (
    <>
      <TouchableOpacity
        onPress={onClick}
        activeOpacity={0.7}
        style={styles.optionMainContainer}>
        {IconLeft && (
          <View
            style={StyleSheet.compose(styles.cardLeftCircle, {
              backgroundColor: backgroundColor,
            })}>
            <IconLeft height={32} width={32} />
          </View>
        )}
        <View style={styles.cardRight}>
          <NumberlessText
            textColor={Colors.primary.mainelements}
            fontSizeType={FontSizeType.l}
            fontType={FontType.md}>
            {title}
          </NumberlessText>
          <NumberlessText
            numberOfLines={2}
            ellipsizeMode="tail"
            textColor={Colors.text.subtitle}
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}>
            {subtitle}
          </NumberlessText>
        </View>
        {IconRight && (
          <View style={styles.iconRightWrapper}>
            <IconRight width={20} height={20} />
          </View>
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  cardLeftCircle: {
    padding: PortSpacing.medium.uniform,
    borderRadius: PortSpacing.medium.uniform,
  },
  iconRightWrapper: {
    alignSelf: 'flex-start',
    paddingTop: PortSpacing.tertiary.top,
  },
  cardRight: {
    gap: 2,
    flex: 1,
    marginHorizontal: PortSpacing.secondary.uniform,
  },
  optionMainContainer: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

export default OptionWithLogoAndChevron;
