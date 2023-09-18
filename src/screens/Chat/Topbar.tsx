import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {View} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import {BackButton} from '../../components/BackButton';
import {useNavigation} from '@react-navigation/native';
import SettingsIcon from '../../../assets/icons/contact-settings.svg';

function Topbar({ nickname, lineId }) {
  const navigation = useNavigation();
  return (
    <View style={styles.bar}>
      <BackButton style={styles.backIcon} onPress={() => navigation.goBack()} />
      <NumberlessSemiBoldText
        style={styles.title}
        ellipsizeMode="tail"
        numberOfLines={1}>
        {nickname}
      </NumberlessSemiBoldText>
      <Pressable
        style={styles.settingsBox}
        onPress={() => {
          navigation.navigate('ContactProfile', { lineId });
        }}>
        <SettingsIcon width={20}/>
      </Pressable>
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
    overflow: 'hidden',
    width: '60%',
    textAlign: 'center',
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
    paddingTop: 12,
  },
});

export default Topbar;
