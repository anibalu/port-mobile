/**
 * The screen to view a group's profile
 * screen Id: N/A
 */
import DefaultImage from '@assets/avatars/avatar.png';
import {
  NumberlessMediumText,
  NumberlessRegularText,
  NumberlessSemiBoldText,
} from '@components/NumberlessText';
import React, {useEffect, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, View} from 'react-native';
// import NamePopup from './UpdateNamePopup';
import BackTopbar from '@components/BackTopBar';
import PermissionsDropdown from '@components/PermissionsDropdown/PermissionsDropdown';
import {SafeAreaView} from '@components/SafeAreaView';

import {GroupInfo} from '@utils/Groups/interfaces';

//import {getConnection} from '@utils/Connections';
import ChatBackground from '@components/ChatBackground';
import {GenericButton} from '@components/GenericButton';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getGroupInfo} from '@utils/Storage/group';
import {getTimeStamp} from '@utils/Time';

type Props = NativeStackScreenProps<AppStackParamList, 'GroupProfile'>;

function GroupProfile({route, navigation}: Props) {
  const {groupId} = route.params;

  const [groupInfo, setGroupInfo] = useState<GroupInfo>({
    groupId: groupId,
    name: '',
    amAdmin: false,
    members: [],
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  //const [connected, setConnected] = useState(true);

  useEffect(() => {
    (async () => {
      //const connection = await getConnection(groupId);
      const groupData = await getGroupInfo(groupId);
      if (
        groupData.pathToGroupProfilePic !== '' &&
        groupData.pathToGroupProfilePic
      ) {
        setProfileURI(`file://${groupData.pathToGroupProfilePic}`);
      }
      setIsAdmin(groupData.amAdmin);
      setGroupInfo(groupData);
      //setConnected(!connection.disconnected);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <BackTopbar />
      <ScrollView
        contentContainerStyle={styles.profileScreen}
        showsVerticalScrollIndicator={false}>
        <ChatBackground />
        <View style={styles.profile}>
          <Pressable
            style={styles.profilePictureHitbox}
            onPress={() => {
              navigation.navigate('ImageView', {
                imageURI: profileURI,
                title: groupInfo.name,
              });
            }}>
            <Image source={{uri: profileURI}} style={styles.profilePic} />
          </Pressable>
          <View style={styles.groupNameArea}>
            <NumberlessSemiBoldText
              style={styles.groupName}
              ellipsizeMode="tail"
              numberOfLines={1}>
              {groupInfo.name}
            </NumberlessSemiBoldText>
            <NumberlessMediumText
              style={styles.groupDetails}
              ellipsizeMode="tail"
              numberOfLines={1}>
              Group | {groupInfo.members.length + 1} participants
            </NumberlessMediumText>
            <NumberlessRegularText
              style={styles.groupDetails}
              ellipsizeMode="tail"
              numberOfLines={1}>
              Created {getTimeStamp(groupInfo.joinedAt)}
            </NumberlessRegularText>
            <NumberlessRegularText
              style={styles.groupDescription}
              ellipsizeMode="tail"
              numberOfLines={3}>
              {groupInfo.description || ''}
            </NumberlessRegularText>
            <View>
              {isAdmin ? (
                <GenericButton
                  onPress={() => {
                    navigation.navigate('ManageMembers', {groupId: groupId});
                  }}
                  buttonStyle={{width: '80%'}}>
                  Manage members
                </GenericButton>
              ) : (
                <GenericButton
                  onPress={() => {
                    navigation.navigate('ManageMembers', {groupId: groupId});
                  }}
                  buttonStyle={{width: '80%'}}>
                  View members
                </GenericButton>
              )}
            </View>
          </View>
        </View>
        <PermissionsDropdown bold={false} chatId={groupId} />
      </ScrollView>
    </SafeAreaView>
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
