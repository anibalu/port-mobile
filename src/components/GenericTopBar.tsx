import {BackButton} from '@components/BackButton';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import React, {memo} from 'react';
import {StyleSheet, TextStyle, View} from 'react-native';

const GenericTopBar = ({
  title,
  titleStyle,
  onBackPress,
  rightOptionalIcon,
}: {
  title: string;
  titleStyle?: TextStyle;
  onBackPress: any;
  rightOptionalIcon?: any;
}) => {
  return (
    <View style={styles.bar}>
      <BackButton style={styles.backIcon} onPress={onBackPress} />
      <NumberlessText
        fontSizeType={FontSizeType.l}
        fontType={FontType.sb}
        style={StyleSheet.compose({left: 15}, titleStyle)}
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
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: 65,
  },
  backIcon: {
    alignItems: 'center',
    width: 50,
    height: 51,
  },
  rightOptionalIconStyle: {
    width: 65,
    height: 65,
    alignItems: 'flex-end',
  },
});

export default memo(GenericTopBar);
