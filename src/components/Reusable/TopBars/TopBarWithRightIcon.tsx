/**
 * Simple Topbar.
 * Takes the following props:
 * 1. Icon left
 * 2. Icon left
 * 3. Heading
 * 4. onIconLeftPress
 * 5. onIconRightPress
 */

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {TOPBAR_HEIGHT} from '@configs/constants';
import React, {FC} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';

const TopBarWithRightIcon = ({
  IconRight,
  heading,
  onIconRightPress,
  bgColor,
  alignLeft = false,
}: {
  alignLeft?: boolean;
  bgColor?: 'b' | 'g';
  onIconRightPress: () => void;
  IconRight?: FC<SvgProps>;
  heading: string;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
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
      <NumberlessText
        style={{textAlign: 'center'}}
        numberOfLines={1}
        textColor={Colors.text.primary}
        ellipsizeMode="tail"
        fontType={FontType.md}
        fontSizeType={FontSizeType.xl}>
        {heading}
      </NumberlessText>
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

const styling = (Color: any) =>
  StyleSheet.create({
    topbarAcontainer: {
      flexDirection: 'row',
      paddingHorizontal: PortSpacing.secondary.uniform,
      alignItems: 'center',
      borderBottomWidth: 0.5,
      borderBottomColor: Color.primary.stroke,
      height: TOPBAR_HEIGHT,
      width: '100%',
    },
  });

export default TopBarWithRightIcon;
