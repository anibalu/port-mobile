import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {ReactNode, memo} from 'react';
import {StyleSheet, View} from 'react-native';
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
          numberOfLines={1}>
          {title}
        </NumberlessText>
      )}

      {RightOptionalIcon ? (
        <RightOptionalIcon
          onPress={onBackPress}
          style={styles.rightOptionalIconStyle}
        />
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
    position: 'absolute',
    right: 30,
  },
});

export default memo(GenericModalTopbar);
