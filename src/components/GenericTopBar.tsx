import React, {memo} from 'react';
import {StyleSheet, TextStyle} from 'react-native';
import {View} from 'react-native';
import {NumberlessSemiBoldText} from '@components/NumberlessText';
import {BackButton} from '@components/BackButton';
import {FontSizes} from './ComponentUtils';

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
      <NumberlessSemiBoldText
        style={StyleSheet.compose(styles.title, titleStyle)}
        ellipsizeMode="tail"
        numberOfLines={1}>
        {title}
      </NumberlessSemiBoldText>
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
    paddingRight: 10,
    paddingLeft: 10,
    backgroundColor: '#FFF',
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: 65,
  },
  title: {
    ...FontSizes[21].semibold,
    lineHeight: 28,
    color: 'black',
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
