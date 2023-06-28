import React from 'react';
import {StyleSheet} from 'react-native';
import {View} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import {BackButton} from '../../components/BackButton';
import {useNavigation} from '@react-navigation/native';

function Topbar({nickname}) {
  const navigation = useNavigation();
  return (
    <View style={styles.bar}>
      <BackButton
        style={styles.backIcon}
        onPress={() => navigation.navigate('Home')}
      />
      <NumberlessSemiBoldText style={styles.title}>
        {nickname}
      </NumberlessSemiBoldText>
      <View style={styles.settingsBox} />
    </View>
  );
}

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
    fontSize: 21,
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
  settingsBox: {
    width: 50,
    alignItems: 'flex-end',
  },
  faqText: {
    marginTop: 10,
    lineHeight: 28,
    fontSize: 15,
  },
});

export default Topbar;
