import React from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from '../../assets/miscellaneous/progressIcon.svg';

const ProgressBar = props => {
  const {progress} = props;

  const progressStyle = {
    width: `${progress}%`,
    backgroundColor: '#547CEF',
    height: 29,
    borderTopLeftRadius: 17.5,
    borderBottomLeftRadius: 17.5,
  };

  return (
    <View style={styles.container}>
      <View style={progressStyle} />
      <View style={styles.icon}>
        <Icon height={14} width={14} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 35,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 17.5,
    paddingRight: 31,
    paddingLeft: 3,
  },
  icon: {
    backgroundColor: '#547CEF',
    height: 29,
    width: 29,
    borderTopRightRadius: 17.5,
    borderBottomRightRadius: 17.5,
    marginLeft: -1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressBar;
