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
  rightElement,
}: {
  title: string;
  titleStyle?: TextStyle;
  onBackPress: any;
  rightElement?: any;
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
      {rightElement ? rightElement : <View style={styles.faqBox} />}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: '6%',
    paddingLeft: '6%',
    backgroundColor: '#FFF',
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: 51,
  },
  title: {
    ...FontSizes[21].semibold,
    lineHeight: 28,
    color: 'black',
    marginTop: 10,
  },
  backIcon: {
    paddingTop: 16,
    alignItems: 'flex-start',
    width: 50,
    height: 51,
  },
  faqBox: {
    width: 50,
    alignItems: 'flex-end',
  },
  faqText: {
    marginTop: 10,
    lineHeight: 28,
    fontSize: 15,
  },
});

export default memo(GenericTopBar);
