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
import {GenericButton} from '@components/GenericButton';
import GenericTopBar from '@components/GenericTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import SearchBar from '@components/SearchBar';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Group from '@utils/Groups/Group';
import {
  GroupDataStrict,
  GroupMember,
  GroupMemberStrict,
} from '@utils/Groups/interfaces';
import {useErrorModal} from 'src/context/ErrorModalContext';
import UserTile from './UserTile';

type Props = NativeStackScreenProps<AppStackParamList, 'ManageMembers'>;

function ManageMembers({route, navigation}: Props) {
  const [searchText, setSearchText] = useState('');
  const {componentNotSupportedyetError} = useErrorModal();

  const {groupId} = route.params;

  const groupHandler = new Group(groupId);
  const [members, setMembers] = useState<GroupMemberStrict[]>([]);

  const [groupData, setGroupData] = useState<GroupDataStrict | null>(null);

  const [viewableMembers, setViewableMembers] = useState<GroupMemberStrict[]>(
    [],
  );
  useEffect(() => {
    (async () => {
      const newGroupData = await groupHandler.getData();
      setGroupData(newGroupData);
      const membersInGroup = await groupHandler.getMembers();
      setMembers(membersInGroup);
      setViewableMembers(membersInGroup ? membersInGroup : []);
      setSearchText('');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (searchText === '' || !searchText) {
      setViewableMembers(members);
    } else {
      setViewableMembers(
        members!.filter(member =>
          member?.name?.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  // const renderItems = useCallback(({item}: {item: GroupMember}) => {
  //   return <UserTile member={item} />;
  // }, []);

  const onUserTilePress = async (member: GroupMember) => {
    try {
      await groupHandler.removeMember(member.memberId!);
      const newGroupData = await groupHandler.getData();
      const membersInGroup = await groupHandler.getMembers();
      setGroupData(newGroupData);
      setMembers(membersInGroup);
      setViewableMembers(membersInGroup);
    } catch (error) {
      console.log('error removing member: ', error);
    }
  };

  function generateNewRows(members: GroupMemberStrict[]) {
    const rows = [];
    if (members && groupData) {
      for (let i = 0; i < members.length; i += 4) {
        const rowMembers = members.slice(i, i + 4);
        rows.push(
          <View
            key={i}
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent:
                rowMembers.length == 4 ? 'space-between' : 'flex-start',
            }}>
            {rowMembers.map((item, index) => (
              <UserTile
                key={index}
                member={item}
                isAdmin={groupData.amAdmin}
                onPress={onUserTilePress}
              />
            ))}
          </View>,
        );
      }
    }
    return rows;
  }

  return (
    <SafeAreaView style={styles.profileScreen}>
      <ChatBackground />
      <GenericTopBar
        title={'Members'}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      {groupData && groupData.amAdmin ? (
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
      ) : (
        <View />
      )}

      <View style={styles.section}>
        <View style={styles.memberSection}>
          <NumberlessMediumText
            style={styles.content}
            ellipsizeMode="tail"
            numberOfLines={1}>
            Other members
          </NumberlessMediumText>
          <NumberlessRegularText style={{fontSize: 15, marginRight: 14}}>
            {members ? members.length : 0} other participants
          </NumberlessRegularText>
        </View>

        <SearchBar
          style={styles.searchBarStyle}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </View>
      <View style={styles.container}>{generateNewRows(viewableMembers)}</View>
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
