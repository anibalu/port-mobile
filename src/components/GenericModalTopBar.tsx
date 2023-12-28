import React, {ReactNode, memo} from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import {NumberlessSemiBoldText} from '@components/NumberlessText';
import {FontSizes} from './ComponentUtils';

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
        <NumberlessSemiBoldText
          style={styles.title}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {title}
        </NumberlessSemiBoldText>
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
    alignSelf: 'flex-end',
    marginRight: 15,
  },
  title: {
    ...FontSizes[21].semibold,
    lineHeight: 28,
    color: 'black',
  },

  rightOptionalIconStyle: {
    width: 65,
    height: 65,
    alignSelf: 'flex-end',
  },
});

export default memo(GenericModalTopbar);
