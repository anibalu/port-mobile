import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {View} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import {BackButton} from '../../components/BackButton';
import {useNavigation} from '@react-navigation/native';
import SettingsIcon from '../../../assets/icons/contact-settings.svg';
import Cross from '../../../assets/icons/cross.svg';

function Topbar({
  name,
  chatId,
  selectedMessages,
  setSelectedMessages,
}: {
  name: string;
  chatId: string;
  selectedMessages: string[];
  setSelectedMessages: any;
}) {
  const navigation = useNavigation();
  return (
    <View style={styles.bar}>
      <BackButton
        style={styles.backIcon}
        onPress={() => {
          setSelectedMessages([]);
          navigation.goBack();
        }}
      />
      <View style={styles.titleBar}>
        {selectedMessages.length >= 1 ? (
          <NumberlessSemiBoldText
            style={styles.selectedCount}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {selectedMessages.length.toString() + '  selected'}
          </NumberlessSemiBoldText>
        ) : (
          <NumberlessSemiBoldText
            style={styles.title}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {name}
          </NumberlessSemiBoldText>
        )}
      </View>
      <View>
        {selectedMessages.length >= 1 ? (
          <Pressable
            style={styles.crossBox}
            onPress={() => {
              setSelectedMessages([]);
            }}>
            <Cross />
          </Pressable>
        ) : (
          <Pressable
            style={styles.settingsBox}
            onPress={() => {
              navigation.navigate('ContactProfile', {chatId});
            }}>
            <SettingsIcon width={20} />
          </Pressable>
        )}
      </View>
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
  titleBar: {
    width: '60%',
  },
  selectedCount: {
    fontSize: 17,
    lineHeight: 28,
    color: 'black',
    marginTop: 10,
    overflow: 'hidden',
    width: '100%',
    textAlign: 'center',
  },
  title: {
    fontSize: 21,
    lineHeight: 28,
    color: 'black',
    marginTop: 10,
    overflow: 'hidden',
    width: '100%',
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
  crossBox: {
    width: 50,
    alignItems: 'flex-end',
    paddingTop: 8,
  },
});

export default Topbar;
