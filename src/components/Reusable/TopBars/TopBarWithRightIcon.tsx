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
  const Colors = DynamicColors();
  const styles = styling(Colors);
  return (
    <View style={styles.topbarAcontainer}>
      <NumberlessText
        style={{textAlign: 'center'}}
        numberOfLines={1}
        textColor={Colors.text.primary}
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

const styling = colors =>
  StyleSheet.create({
    topbarAcontainer: {
      flexDirection: 'row',
      paddingHorizontal: PortSpacing.secondary.uniform,
      alignItems: 'center',
      backgroundColor: colors.primary.surface,
      height: 56,
      justifyContent: 'center',
      width: '100%',
    },
  });

export default TopBarWithRightIcon;
