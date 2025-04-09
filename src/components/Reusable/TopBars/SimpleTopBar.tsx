/**
 * Simple Topbar.
 * Takes the following props:
 * 1. Icon left
 * 2. Icon left
 * 3. Heading
 * 4. onIconLeftPress
 * 5. onIconRightPress
 */

import React, {FC} from 'react';
import {Pressable, StyleSheet,View} from 'react-native';

import {SvgProps} from 'react-native-svg';

import {BackButton} from '@components/BackButton';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {TOPBAR_HEIGHT} from '@configs/constants';


const SimpleTopbar = ({
  IconLeft,
  IconRight,
  heading,
  onIconLeftPress,
  onIconRightPress,
}: {
  onIconLeftPress: () => void;
  onIconRightPress?: () => void;
  IconLeft: FC<SvgProps>;
  IconRight?: FC<SvgProps>;
  heading: string;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <View style={styles.topbarAcontainer}>
      <BackButton
        Icon={IconLeft}
        onPress={onIconLeftPress}
        style={{
          width: 24,
          alignItems: 'center',
          paddingTop: 13,
        }}
      />
      <NumberlessText
        style={{
          textAlign: 'center',
          alignSelf: 'center',
          flex: 1,
        }}
        numberOfLines={1}
        textColor={Colors.text.primary}
        ellipsizeMode="tail"
        fontType={FontType.md}
        fontSizeType={FontSizeType.xl}>
        {heading}
      </NumberlessText>
      {IconRight && (
        <Pressable onPress={onIconRightPress}>
          <IconRight width={24} height={24} />
        </Pressable>
      )}
    </View>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    topbarAcontainer: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      paddingHorizontal: 16,
      alignItems: 'center',
      backgroundColor: color.primary.surface,
      height: TOPBAR_HEIGHT,
      borderBottomColor: color.primary.stroke,
      borderBottomWidth: 0.5,
    },
  });

export default SimpleTopbar;
