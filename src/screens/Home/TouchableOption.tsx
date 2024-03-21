import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {SvgProps} from 'react-native-svg';
import BlackAngleRight from '@assets/icons/BlackAngleRight.svg';

const TouchableOption = ({
  onClick,
  IconLeft,
  title,
  subtitle,
  showBorderBottom = true,
}: {
  onClick: () => void;
  IconLeft: FC<SvgProps>;
  title: string;
  subtitle: string;
  showBorderBottom?: boolean;
}) => {
  return (
    <TouchableOpacity
      disabled={false}
      style={{paddingHorizontal: PortSpacing.secondary.uniform}}
      onPress={onClick}
      accessibilityIgnoresInvertColors
      activeOpacity={0.6}>
      <View
        style={StyleSheet.compose(styles.listItem, {
          borderBottomWidth: showBorderBottom ? 1 : 0,
        })}>
        <IconLeft width={24} height={24} />
        <View style={styles.listContentWrapper}>
          <NumberlessText
            style={{color: PortColors.primary.black}}
            fontSizeType={FontSizeType.l}
            fontType={FontType.rg}>
            {title}
          </NumberlessText>
          <NumberlessText
            style={{color: PortColors.text.secondary}}
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}>
            {subtitle}
          </NumberlessText>
        </View>
        <BlackAngleRight width={20} height={20} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: PortSpacing.secondary.uniform,
    borderRadius: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderBottomColor: PortColors.stroke,
  },
  listContentWrapper: {
    marginLeft: PortSpacing.secondary.uniform,
    flexDirection: 'column',
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});

export default TouchableOption;
