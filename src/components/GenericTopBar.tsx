import {BackButton} from '@components/BackButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {memo} from 'react';
import {StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {PortColors} from './ComponentUtils';

const GenericTopBar = ({
  title,
  titleStyle,
  onBackPress,
  rightOptionalIcon,
  barStyle,
}: {
  title: string;
  titleStyle?: TextStyle;
  barStyle?: ViewStyle;
  onBackPress: any;
  rightOptionalIcon?: any;
}) => {
  return (
    <View style={StyleSheet.compose(styles.bar, barStyle)}>
      <BackButton style={styles.backIcon} onPress={onBackPress} />
      <NumberlessText
        fontSizeType={FontSizeType.l}
        fontType={FontType.sb}
        style={StyleSheet.compose({left: 15, maxWidth: '65%'}, titleStyle)}
        ellipsizeMode="tail"
        numberOfLines={1}>
        {title}
      </NumberlessText>
      {rightOptionalIcon ? (
        rightOptionalIcon
      ) : (
        <View style={styles.rightOptionalIconStyle} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 8,
    backgroundColor: PortColors.primary.white,
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: 56,
  },
  backIcon: {
    alignItems: 'center',
    paddingTop: 12,
    width: 40,
    height: 40,
  },
  rightOptionalIconStyle: {
    width: 65,
    height: 65,
    alignItems: 'flex-end',
  },
});

export default memo(GenericTopBar);
