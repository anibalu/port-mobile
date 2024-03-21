/**
 * Simple Topbar.
 * Takes the following props:
 * 1. Icon left
 * 2. Icon left
 * 3. Heading
 * 4. onIconLeftPress
 * 5. onIconRightPress
 */

import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {FC} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {View} from 'react-native';
import {SvgProps} from 'react-native-svg';

const TopBarWithRightIcon = ({
  IconRight,
  heading,
  onIconRightPress,
}: {
  onIconRightPress: () => void;
  IconRight?: FC<SvgProps>;
  heading: string;
}) => {
  return (
    <View style={styles.topbarAcontainer}>
      <NumberlessText
        style={{textAlign: 'center'}}
        numberOfLines={1}
        ellipsizeMode="tail"
        fontType={FontType.md}
        fontSizeType={FontSizeType.l}>
        {heading}
      </NumberlessText>
      {IconRight && (
        <Pressable
          style={{position: 'absolute', right: 16}}
          onPress={onIconRightPress}>
          <IconRight width={24} height={24} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topbarAcontainer: {
    flexDirection: 'row',
    paddingHorizontal: PortSpacing.secondary.uniform,
    alignItems: 'center',
    backgroundColor: PortColors.primary.white,
    height: 56,
    justifyContent: 'center',
    width: '100%',
  },
});

export default TopBarWithRightIcon;
