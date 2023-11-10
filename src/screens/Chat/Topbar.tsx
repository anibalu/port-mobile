import React from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import {View} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import {BackButton} from '../../components/BackButton';
import {useNavigation} from '@react-navigation/native';
import SettingsIcon from '../../../assets/icons/contact-settings.svg';
import Cross from '../../../assets/icons/cross.svg';

function Topbar({
  name,
  chatId,
  //profile Uri
  selectedMessages,
  setSelectedMessages,
  isGroupChat,
  profileURI,
}: {
  name: string;
  chatId: string;
  //type string
  selectedMessages: string[];
  setSelectedMessages: any;
  isGroupChat: boolean;
  profileURI?: string;
}) {
  const navigation = useNavigation();
  return (
    <View style={styles.bar}>
      <View style={styles.backAndProfile}>
        <BackButton
          style={styles.backIcon}
          onPress={() => {
            setSelectedMessages([]);
            navigation.goBack();
          }}
        />
        {profileURI && (
          <Image source={{uri: profileURI}} style={styles.profile} />
        )}
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
              if (isGroupChat) {
                navigation.navigate('GroupProfile', {groupId: chatId});
              } else {
                navigation.navigate('ContactProfile', {chatId});
              }
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
    alignItems: 'center',
    paddingRight: '6%',
    paddingLeft: '6%',
    backgroundColor: '#FFF',
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: 70,
  },
  titleBar: {
    marginLeft: 10,
    maxWidth: '60%',
  },
  selectedCount: {
    fontSize: 17,
    lineHeight: 28,
    color: 'black',
    overflow: 'hidden',
    width: '100%',
    textAlign: 'center',
  },
  title: {
    fontSize: 21,
    lineHeight: 28,
    color: 'black',
    overflow: 'hidden',
    width: '100%',
    textAlign: 'center',
  },
  backIcon: {
    alignItems: 'flex-start',
  },
  settingsBox: {
    width: 50,
    alignItems: 'flex-end',
  },
  crossBox: {
    width: 50,
    alignItems: 'flex-end',
  },
  profile: {
    height: 50,
    width: 50,
    borderRadius: 20,
    marginLeft: -20,
  },
  backAndProfile: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

export default Topbar;
