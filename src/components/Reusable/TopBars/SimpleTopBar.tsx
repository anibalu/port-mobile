/**
 * Simple Topbar.
 * Takes the following props:
 * 1. Icon left
 * 2. Icon left
 * 3. Heading
 * 4. onIconLeftPress
 * 5. onIconRightPress
 */

import {PortColors} from '@components/ComponentUtils';
import {FontSizeType, FontType, getWeight} from '@components/NumberlessText';
import React, {FC} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
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
  return (
    <View style={styles.topbarAcontainer}>
      <Pressable onPress={onIconLeftPress}>
        <IconLeft width={24} height={24} />
      </Pressable>
      <Text style={styles.heading} numberOfLines={1}>
        {heading}
      </Text>
      <Pressable onPress={onIconRightPress}>
        <IconRight width={24} height={24} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  topbarAcontainer: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PortColors.primary.white,
    height: 56,
  },
  heading: {
    color: PortColors.title,
    fontFamily: FontType.md,
    fontSize: FontSizeType.l,
    fontWeight: getWeight(FontType.rg),
  },
});

export default SimpleTopbar;
