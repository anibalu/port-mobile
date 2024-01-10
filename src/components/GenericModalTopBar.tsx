import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {ReactNode, memo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {screen} from './ComponentUtils';

const GenericModalTopbar = ({
  title,
  onBackPress,
  RightOptionalIcon,
}: {
  title?: string;
  onBackPress?: any;
  RightOptionalIcon?: any;
}): ReactNode => {
  return (
    <View style={styles.bar}>
      {title && (
        <NumberlessText
          fontSizeType={FontSizeType.l}
          fontType={FontType.md}
          ellipsizeMode="tail"
          style={{maxWidth: '80%'}}
          numberOfLines={1}>
          {title}
        </NumberlessText>
      )}

      {RightOptionalIcon ? (
        <Pressable
          style={{position: 'absolute', right: 30}}
          hitSlop={{top: 15, right: 15, left: 15, bottom: 15}}
          onPress={onBackPress}>
          <RightOptionalIcon style={styles.rightOptionalIconStyle} />
        </Pressable>
      ) : (
        <View />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    marginVertical: 20,
    width: screen.width,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  rightOptionalIconStyle: {
    width: 65,
    height: 65,
  },
});

export default memo(GenericModalTopbar);
