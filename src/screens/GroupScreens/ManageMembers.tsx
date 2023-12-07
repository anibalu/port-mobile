/**
 * The screen to view and manage members for a group
 * screen Id: N/A
 */
import {
  NumberlessMediumText,
  NumberlessRegularText,
} from '@components/NumberlessText';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
// import NamePopup from './UpdateNamePopup';
import ChatBackground from '@components/ChatBackground';
import GenericTopBar from '@components/GenericTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import SearchBar from '@components/SearchBar';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {GroupInfo, GroupMember} from '@utils/Groups/interfaces';
import {getGroupInfo} from '@utils/Storage/group';

import {FontSizes} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import UserTile from './UserTile';
import {useErrorModal} from 'src/context/ErrorModalContext';

type Props = NativeStackScreenProps<AppStackParamList, 'ManageMembers'>;

function ManageMembers({route, navigation}: Props) {
  const [searchText, setSearchText] = useState('');
  const {componentNotSupportedyetError} = useErrorModal();

  const {groupId} = route.params;

  const [groupInfo, setGroupInfo] = useState<GroupInfo>({
    groupId: groupId,
    name: '',
    amAdmin: false,
    members: [],
  });
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [viewableMembers, setViewableMembers] = useState<GroupMember[]>([]);

  useEffect(() => {
    if (searchText === '' || searchText === undefined) {
      setViewableMembers(groupMembers);
    } else {
      setViewableMembers(
        groupMembers.filter(member =>
          member?.name?.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const localGroupInfo = await getGroupInfo(groupId);
        setGroupInfo(localGroupInfo);
        setGroupMembers(localGroupInfo.members);
        setViewableMembers(localGroupInfo.members);
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // const renderItems = useCallback(({item}: {item: GroupMember}) => {
  //   return <UserTile member={item} />;
  // }, []);

  const rows = [];
  for (let i = 0; i < viewableMembers.length; i += 4) {
    const rowMembers = viewableMembers.slice(i, i + 4);
    rows.push(
      <View
        key={i}
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent:
            rowMembers.length == 4 ? 'space-between' : 'flex-start',
        }}>
        {rowMembers.map(item => (
          <UserTile member={item} />
        ))}
      </View>,
    );
  }

  return (
    <SafeAreaView style={styles.profileScreen}>
      <ChatBackground />
      <GenericTopBar
        title={'Members'}
        titleStyle={{...FontSizes[17].semibold}}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      {groupInfo?.amAdmin && (
        <View
          style={{
            flexDirection: 'row',
            width: '90%',
            justifyContent: 'space-between',
          }}>
          <GenericButton
            onPress={() => {
              componentNotSupportedyetError();
            }}
            buttonStyle={{
              width: '47%',
              height: 60,
              marginTop: 30,
              backgroundColor: '#868686',
            }}>
            Existing ports
          </GenericButton>
          <GenericButton
            onPress={() => {
              navigation.navigate('ShareGroup', {groupId: groupId});
            }}
            buttonStyle={{width: '47%', height: 60, marginTop: 30}}>
            Group invite
          </GenericButton>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.memberSection}>
          <NumberlessMediumText
            style={styles.content}
            ellipsizeMode="tail"
            numberOfLines={1}>
            Members
          </NumberlessMediumText>
          <NumberlessRegularText style={{fontSize: 15, marginRight: 14}}>
            {groupInfo.members.length + 1} participants
          </NumberlessRegularText>
        </View>

        <SearchBar
          style={styles.searchBarStyle}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </View>
      <View style={styles.container}>{rows}</View>
      {/* <FlatList
        numColumns={4}
        style={{width: '100%'}}
        contentContainerStyle={{
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        data={viewableMembers}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        renderItem={renderItems}
      /> */}
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
  memberSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginTop: 31,
  },
  searchBarStyle: {
    width: '93%',
    borderRadius: 8,
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 4,
    paddingLeft: 20,
    height: 46,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  exitButton: {
    width: '90%',
    backgroundColor: '#EE786B',
    marginBottom: 22,
  },
  itemCardHitbox: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
  },
  titleBox: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerTextStyle: {
    fontSize: 17,
    color: 'black',
    left: 18,
  },
  groupSetupText: {
    fontSize: 15,
    color: 'black',
    left: 12,
  },
  superportWrapper: {
    display: 'flex',
    borderRadius: 16,
    marginLeft: 6,
    width: 145,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingBottom: 6,
  },

  profileScreen: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
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
  profilePictureHitbox: {
    width: 152,
    height: 152,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  profilePic: {
    width: 132,
    height: 132,
    borderRadius: 44,
    marginBottom: 10,
    marginRight: 10,
  },
  groupNameArea: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  section: {
    marginBottom: 22,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
  groupName: {
    fontSize: 19,
    color: 'black',
    textAlign: 'center',
  },
  groupDetails: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.28)',
    textAlign: 'center',
    marginTop: 7,
  },
  groupDescription: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center',
    marginVertical: 26,
  },
  groupNameEditBox: {
    width: '100%',
    position: 'absolute',
    display: 'flex',
    top: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  groupNameEdit: {
    width: 24,
    height: 24,
  },
  groupNameEditHitbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center',
    marginVertical: 8,
    marginLeft: 14,
  },
  empty: {
    width: 40,
    height: 40,
  },
  popUpArea: {
    backgroundColor: '#0005',
    width: '100%',
    height: '100%',
  },
  popupPosition: {
    position: 'absolute',
    bottom: 0,
  },
  updatePicture: {
    width: 40,
    height: 40,
    backgroundColor: '#547CEF',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '95%',
  },
});

export default ManageMembers;
