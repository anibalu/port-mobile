/**
 * Simple Topbar.
 * Takes the following props:
 * 1. Icon left
 * 2. Icon left
 * 3. Heading
 * 4. onIconLeftPress
 * 5. onIconRightPress
 */

import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {FC} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';

const SimpleTopbar = ({
  IconLeft,
  IconRight,
  heading,
  onIconLeftPress,
  onIconRightPress,
}: {
  onIconLeftPress: () => void;
  onIconRightPress: () => void;
  IconLeft: FC<SvgProps>;
  IconRight: FC<SvgProps>;
  heading: string;
}) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <View style={styles.topbarAcontainer}>
      <Pressable onPress={onIconLeftPress}>
        <IconLeft width={24} height={24} />
      </Pressable>
      <NumberlessText
        style={{textAlign: 'center'}}
        numberOfLines={1}
        textColor={Colors.text.primary}
        ellipsizeMode="tail"
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}>
        {heading}
      </NumberlessText>
      <Pressable onPress={onIconRightPress}>
        <IconRight width={24} height={24} />
      </Pressable>
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
      justifyContent: 'space-between',
      backgroundColor: color.primary.surface,
      height: 56,
    },
  });

export default SimpleTopbar;
