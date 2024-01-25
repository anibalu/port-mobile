/**
 * The screen to view a group's profile
 * screen Id: N/A
 */
import Play from '@assets/icons/videoPlay.svg';
import {
  FontSizeType,
  FontType,
  NumberlessMediumText,
  NumberlessRegularText,
  NumberlessSemiBoldText,
  NumberlessText,
} from '@components/NumberlessText';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
// import NamePopup from './UpdateNamePopup';
import BackTopbar from '@components/BackTopBar';
import GroupChatPermissionDropdown from '@components/PermissionsDropdown/GroupChatPermissionDropdown';
import {SafeAreaView} from '@components/SafeAreaView';
import FileViewer from 'react-native-file-viewer';

import {GroupDataStrict, GroupMemberStrict} from '@utils/Groups/interfaces';

//import {getConnection} from '@utils/Connections';
import ChatBackground from '@components/ChatBackground';
import {PortColors, screen} from '@components/ComponentUtils';
import DeleteChatButton from '@components/DeleteChatButton';
import {GenericAvatar} from '@components/GenericAvatar';
import {GenericButton} from '@components/GenericButton';
import {DEFAULT_AVATAR} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getConnection} from '@utils/Connections';
import Group from '@utils/Groups/Group';
import {MediaEntry} from '@utils/Media/interfaces';
import {ContentType} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {getImagesAndVideos} from '@utils/Storage/media';
import {getTimeStamp} from '@utils/Time';

type Props = NativeStackScreenProps<AppStackParamList, 'GroupProfile'>;

function GroupProfile({route, navigation}: Props) {
  const {groupId} = route.params;
  const groupHandler = new Group(groupId);
  const [members, setMembers] = useState<GroupMemberStrict[] | null>([]);

  const [groupData, setGroupData] = useState<GroupDataStrict | null>();

  const [profileURI, setProfileURI] = useState(DEFAULT_AVATAR);
  const [connected, setConnected] = useState(true);
  const [media, setMedia] = useState<MediaEntry[]>([]);
  const loadMedia = async () => {
    const response = await getImagesAndVideos(groupId);
    setMedia(response);
  };

  //Fetching media on profile open. Callback isn't made, as fetch can happen as many times as needed.
  useFocusEffect(() => {
    loadMedia();
  });

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

  const renderSelectedPhoto = ({item}: {item: MediaEntry}) => {
    return (
      <Pressable
        key={item.mediaId}
        onPress={() => {
          FileViewer.open(getSafeAbsoluteURI(item.filePath, 'doc'), {
            showOpenWithDialog: true,
          });
        }}>
        <>
          <Image
            source={{
              uri:
                item.type === ContentType.video && item.previewPath != undefined
                  ? getSafeAbsoluteURI(item.previewPath, 'cache')
                  : getSafeAbsoluteURI(item.filePath, 'doc'),
            }}
            style={styles.image}
          />
          {item.type === ContentType.video && (
            <Play
              style={{
                position: 'absolute',
                top: 0.25 * screen.width - 55,
                left: 0.25 * screen.width - 55,
              }}
            />
          )}
        </>
      </Pressable>
    );
  };

  return groupData ? (
    <SafeAreaView style={styles.mainContainer}>
      <ChatBackground />
      <BackTopbar />
      <ScrollView
        contentContainerStyle={styles.profileScreen}
        showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <GenericAvatar profileUri={profileURI} avatarSize={'medium'} />
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
            {groupData.description && (
              <NumberlessRegularText
                style={styles.groupDescription}
                ellipsizeMode="tail"
                numberOfLines={3}>
                {groupData.description || ''}
              </NumberlessRegularText>
            )}

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

        <View style={styles.content}>
          <View style={styles.mediaView}>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}>
              Shared media
            </NumberlessText>
            {media.length > 0 && (
              <GenericButton
                onPress={() =>
                  navigation.navigate('SharedMedia', {chatId: groupId})
                }
                textStyle={styles.seealltext}
                buttonStyle={styles.seeall}>
                See all
              </GenericButton>
            )}
          </View>

          <FlatList
            contentContainerStyle={{marginTop: 12}}
            data={media.slice(0, 10)}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            horizontal={true}
            renderItem={renderSelectedPhoto}
            ListEmptyComponent={
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontType={FontType.sb}
                textColor={PortColors.text.secondary}
                style={{
                  textAlign: 'center',
                  width: screen.width,
                  right: 20,
                }}>
                No shared media
              </NumberlessText>
            }
          />
        </View>
        {connected ? (
          <GenericButton
            onPress={async () => {
              await groupHandler.leaveGroup();
              navigation.navigate('HomeTab');
            }}
            buttonStyle={{
              width: '90%',
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
  mediaView: {
    flexDirection: 'row',
    marginTop: 15,
  },
  itemCard: {
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 16,
    marginLeft: 14,
    width: '93%',
  },
  image: {
    width: (screen.width - 30) / 3,
    height: (screen.width - 30) / 3,
    margin: 5,
    borderRadius: 24,
  },
  seeall: {
    backgroundColor: 'white',
    position: 'absolute',
    right: 0,
    top: -10,
  },
  seealltext: {
    color: PortColors.text.secondary,
    fontSize: FontSizeType.s,
    fontWeight: '500',
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
    alignItems: 'center',
    paddingBottom: 32,
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
  content: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center',
    marginVertical: 10,
    paddingBottom: 15,
    backgroundColor: 'white',
    width: screen.width,
    paddingLeft: 10,
    marginBottom: 20,
  },
});

export default GroupProfile;
