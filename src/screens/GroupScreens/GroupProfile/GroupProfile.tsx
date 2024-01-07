/**
 * The screen to view a group's profile
 * screen Id: N/A
 */
import {
  NumberlessMediumText,
  NumberlessRegularText,
  NumberlessSemiBoldText,
} from '@components/NumberlessText';
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
// import NamePopup from './UpdateNamePopup';
import BackTopbar from '@components/BackTopBar';
import GroupChatPermissionDropdown from '@components/PermissionsDropdown/GroupChatPermissionDropdown';
import {SafeAreaView} from '@components/SafeAreaView';

import {GroupDataStrict, GroupMemberStrict} from '@utils/Groups/interfaces';

//import {getConnection} from '@utils/Connections';
import ChatBackground from '@components/ChatBackground';
import {PortColors} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Group from '@utils/Groups/Group';
import {getTimeStamp} from '@utils/Time';
import {GenericAvatar} from '@components/GenericAvatar';
import {DEFAULT_AVATAR} from '@configs/constants';
import {getConnection} from '@utils/Connections';
import DeleteChatButton from '@components/DeleteChatButton';

type Props = NativeStackScreenProps<AppStackParamList, 'GroupProfile'>;

function GroupProfile({route, navigation}: Props) {
  const {groupId} = route.params;
  const groupHandler = new Group(groupId);
  const [members, setMembers] = useState<GroupMemberStrict[] | null>([]);

  const [groupData, setGroupData] = useState<GroupDataStrict | null>();

  const [profileURI, setProfileURI] = useState(DEFAULT_AVATAR);
  const [connected, setConnected] = useState(true);
  const onDelete = async () => {
    await groupHandler.deleteGroup();
    navigation.navigate('HomeTab');
  };
  useEffect(() => {
    (async () => {
      const groupData = await groupHandler.getData();
      if (groupData?.groupPicture !== '' && groupData?.groupPicture) {
        setProfileURI(groupData.groupPicture);
      }
      try {
        const connection = await getConnection(groupId);
        setConnected(!connection.disconnected);
      } catch (error) {
        console.log('error getting connected:', error);
      }
      setMembers(await groupHandler.getMembers());
      setGroupData(groupData);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return groupData ? (
    <SafeAreaView style={styles.mainContainer}>
      <BackTopbar />
      <ScrollView
        contentContainerStyle={styles.profileScreen}
        showsVerticalScrollIndicator={false}>
        <ChatBackground />
        <View style={styles.profile}>
          <GenericAvatar profileUri={profileURI} avatarSize={'large'} />
          <View style={styles.groupNameArea}>
            <NumberlessSemiBoldText
              style={styles.groupName}
              ellipsizeMode="tail"
              numberOfLines={1}>
              {groupData.name}
            </NumberlessSemiBoldText>
            <NumberlessMediumText
              style={styles.groupDetails}
              ellipsizeMode="tail"
              numberOfLines={1}>
              Group | {members ? members.length + 1 : 1} participants
            </NumberlessMediumText>
            <NumberlessRegularText
              style={styles.groupDetails}
              ellipsizeMode="tail"
              numberOfLines={1}>
              Created {getTimeStamp(groupData.joinedAt)}
            </NumberlessRegularText>
            <NumberlessRegularText
              style={styles.groupDescription}
              ellipsizeMode="tail"
              numberOfLines={3}>
              {groupData.description || ''}
            </NumberlessRegularText>
            <View>
              {groupData.amAdmin ? (
                <GenericButton
                  onPress={() => {
                    navigation.navigate('ManageMembers', {groupId: groupId});
                  }}>
                  Manage members
                </GenericButton>
              ) : (
                <GenericButton
                  onPress={() => {
                    navigation.navigate('ManageMembers', {groupId: groupId});
                  }}>
                  View members
                </GenericButton>
              )}
            </View>
          </View>
        </View>
        <GroupChatPermissionDropdown bold={false} chatId={groupId} />
        {connected ? (
          <GenericButton
            onPress={async () => {
              await groupHandler.leaveGroup();
              navigation.navigate('HomeTab');
            }}
            buttonStyle={{
              width: '90%',
              marginTop: 38,
              height: 70,
              backgroundColor: PortColors.primary.red.error,
            }}>
            Exit group
          </GenericButton>
        ) : (
          <DeleteChatButton onDelete={onDelete} stripMargin={true} />
        )}
      </ScrollView>
    </SafeAreaView>
  ) : (
    <></>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    height: '100%',
  },
  itemCard: {
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 16,
    marginLeft: 14,
    width: '93%',
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
    height: '100%',
  },
  profile: {
    backgroundColor: 'white',
    width: '100%',
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
    width: '90%',
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
});

export default GroupProfile;
