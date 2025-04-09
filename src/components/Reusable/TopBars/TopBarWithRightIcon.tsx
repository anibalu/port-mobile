/**
 * Simple Topbar.
 * Takes the following props:
 * 1. Icon left
 * 2. Icon left
 * 3. Heading
 * 4. onIconLeftPress
 * 5. onIconRightPress
 * 6. onHeadingPress
 * 7. HeadingIcon
 */

import {PortSpacing, isIOS} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {TOPBAR_HEIGHT} from '@configs/constants';
import React, {FC} from 'react';
import {Pressable, StyleSheet,View} from 'react-native';
import {SvgProps} from 'react-native-svg';

const TopBarWithRightIcon = ({
  IconRight,
  HeadingIcon,
  onHeadingPress,
  heading,
  onIconRightPress,
  bgColor,
  alignLeft = false,
  borderBottom = true,
}: {
  borderBottom?: boolean;
  alignLeft?: boolean;
  bgColor?: 'b' | 'g';
  onIconRightPress: () => void;
  onHeadingPress?: () => void;
  HeadingIcon?: FC<SvgProps>;
  IconRight?: FC<SvgProps>;
  heading: string;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors, borderBottom);
  return (
    <View
      style={StyleSheet.compose(styles.topbarAcontainer, {
        justifyContent: alignLeft ? 'space-between' : 'center',
        borderBottomColor: Colors.primary.stroke,
        backgroundColor: bgColor
          ? bgColor === 'b'
            ? Colors.primary.background
            : Colors.primary.surface
          : Colors.primary.surface,
      })}>
      <Pressable onPress={onHeadingPress} style={{alignItems: 'center'}}>
        <NumberlessText
          style={{textAlign: 'center'}}
          numberOfLines={1}
          textColor={Colors.text.primary}
          ellipsizeMode="tail"
          fontType={FontType.md}
          fontSizeType={FontSizeType.xl}>
          {heading}
        </NumberlessText>
        {HeadingIcon && (
          <View
            style={{
              position: 'absolute',
              right: -28,
              top: isIOS ? 2 : 4,
            }}>
            <HeadingIcon width={20} height={20} />
          </View>
        )}
      </Pressable>
      {IconRight && (
        <Pressable
          style={{position: 'absolute', right: 16}}
          onPress={onIconRightPress}
          hitSlop={60}>
          <IconRight width={24} height={24} />
        </Pressable>
      )}
    </View>
  );
};

const styling = (Color: any, borderBottom: boolean) =>
  StyleSheet.create({
    topbarAcontainer: {
      flexDirection: 'row',
      paddingHorizontal: PortSpacing.secondary.uniform,
      alignItems: 'center',
      borderBottomWidth: borderBottom ? 0.5 : 0,
      borderBottomColor: Color.primary.stroke,
      height: TOPBAR_HEIGHT,
      width: '100%',
    },
  });

export default TopBarWithRightIcon;
