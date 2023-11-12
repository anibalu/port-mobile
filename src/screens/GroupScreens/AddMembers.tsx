/**
 * The screen to view and manage members for a group
 * screen Id: N/A
 */
import React, {useCallback, useEffect, useState} from 'react';

import {
  FlatList,
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {NumberlessMediumText} from '../../components/NumberlessText';
// import NamePopup from './UpdateNamePopup';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView} from '../../components/SafeAreaView';
import {NAME_LENGTH_LIMIT} from '../../configs/constants';
import Share from '../../../assets/icons/Share.svg';
import Topbar from './Topbar';
import Search from '../../../assets/icons/GreySearch.svg';
import AddMemberTile from './AddMemberTile';
import {ConnectionInfo} from '../../utils/Connections/interfaces';
import Tick from '../../../assets/icons/tick.svg';
import {getDirectChats} from '../../utils/DirectChats';
import SelectedMemberTile from './SelectedMemberTile';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '../../navigation/AppStackTypes';

type Props = NativeStackScreenProps<AppStackParamList, 'AddMembers'>;

function AddMembers({route, navigation}: Props) {
  //gets groupId of group
  const {groupId} = route.params;
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const onChangeText = (newName: string) => {
    setSearchText(newName);
  };

  //Members that have been selected via the checkbox
  const [selectedMembers, setSelectedMembers] = useState<ConnectionInfo[]>([]);

  //All members who can be invited
  const [allMembers, setAllMembers] = useState<ConnectionInfo[]>([]);

  //Members that have been searched for
  const [viewableMembers, setViewableMembers] = useState<ConnectionInfo[]>([]);

  //focus effect to load connections from cache and count unread connections
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        loadConnections();
      })();
    }, []),
  );

  async function loadConnections() {
    setAllMembers(await getDirectChats());
  }

  //Updates list of viewable members if new members are added to the list.
  useEffect(() => {
    setViewableMembers(allMembers);
  }, [allMembers]);

  const onMemberSelected = (member: ConnectionInfo) => {
    //If member exists, we remove
    if (selectedMembers.some(val => val.chatId === member.chatId)) {
      setSelectedMembers(oldList =>
        oldList.filter(val => val.chatId !== member.chatId),
      );
    } else {
      setSelectedMembers(oldList => [...oldList, member]);
    }
  };

  const onMemberRemoved = (member: ConnectionInfo) => {
    setSelectedMembers(oldList =>
      oldList.filter(val => val.chatId !== member.chatId),
    );
  };

  useEffect(() => {
    if (searchText === '' || searchText == undefined) {
      setViewableMembers(allMembers);
    } else {
      setViewableMembers(
        allMembers.filter(member => member.name.includes(searchText)),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const renderSelectedMember = useCallback((member: any) => {
    return (
      <SelectedMemberTile member={member.item} onRemove={onMemberRemoved} />
    );
  }, []);

  return (
    <SafeAreaView style={styles.profileScreen}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      />
      <Topbar
        title={
          selectedMembers.length > 0
            ? 'Selected ' + selectedMembers.length
            : 'Add members'
        }
      />
      <View
        style={{
          backgroundColor: '#FFF',
          borderBottomColor: '#EEE',
          borderBottomWidth: 0.5,
          width: '100%',
          flexDirection: 'row',
        }}>
        <FlatList
          style={{width: '100%'}}
          contentContainerStyle={{marginLeft: 16}}
          data={selectedMembers}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          renderItem={renderSelectedMember}
        />
      </View>
      <View style={{flexDirection: 'row', marginHorizontal: 14, marginTop: 16}}>
        <View
          style={{
            width: '60%',
            borderRadius: 8,
            flexDirection: 'row',
            paddingLeft: 20,
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
          }}>
          <Search color={'grey'} />
          <TextInput
            style={{marginLeft: 20, flex: 1}}
            textAlign="left"
            maxLength={NAME_LENGTH_LIMIT}
            placeholder={isFocused ? '' : 'Search'}
            placeholderTextColor="#BABABA"
            onChangeText={onChangeText}
            value={searchText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
        <Pressable
          style={{
            backgroundColor: '#547CEF',
            padding: 11,
            marginLeft: 5,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
          }}
          onPress={() => {
            navigation.navigate('ShareGroup', {groupId: groupId});
          }}>
          <Share />
          <NumberlessMediumText
            style={{fontSize: 15, color: '#FFFFFF', marginLeft: 6}}>
            Group Invite
          </NumberlessMediumText>
        </Pressable>
      </View>
      <FlatList
        style={{width: '100%'}}
        contentContainerStyle={{
          marginTop: 12,
        }}
        data={viewableMembers}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        renderItem={(item: any) => {
          return (
            <AddMemberTile member={item.item} onToggle={onMemberSelected} />
          );
        }}
      />
      <Pressable
        onPress={() => {
          //@ani do stuff with selected members.
        }}
        style={{
          width: 70,
          height: 70,
          backgroundColor: '#547CEF',
          padding: 23,
          position: 'absolute',
          bottom: 28,
          right: 25,
          borderRadius: 16,
        }}>
        <Tick />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 16,
    marginLeft: 14,
    width: '93%',
  },

  titleBox: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  profileScreen: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
  },
  background: {
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#F9F9F9',
    opacity: 0.5,
    overflow: 'hidden',
  },
  profile: {
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  profilePic: {
    width: 132,
    height: 132,
    borderRadius: 44,
    marginBottom: 10,
    marginRight: 10,
  },
  content: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center',
    marginVertical: 8,
    marginLeft: 14,
  },
});

export default AddMembers;
