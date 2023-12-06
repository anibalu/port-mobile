/**
 * The screen to view one's own profile
 * screen Id: 8
 */
import DefaultImage from '@assets/avatars/avatar.png';
import EditCameraIcon from '@assets/icons/EditCamera.svg';
import EditIcon from '@assets/icons/Pencil.svg';
import BackTopbar from '@components/BackTopBar';
import ChatBackground from '@components/ChatBackground';
import GenericModal from '@components/GenericModal';
import {NumberlessSemiBoldText} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import UpdateNamePopup from '@components/UpdateNamePopup';
import {DEFAULT_NAME} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getProfileName, getProfilePicture} from '@utils/Profile';
import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {GenericAvatar} from '@components/GenericAvatar';
import {useFocusEffect} from '@react-navigation/native';
import ReportIssueModal from '../BugReporting/ReportIssueModal';

type Props = NativeStackScreenProps<AppStackParamList, 'MyProfile'>;

function MyProfile({navigation}: Props) {
  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  const [name, setName] = useState(DEFAULT_NAME);
  const [updatedCounter, setUpdatedCounter] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [reportbugModalOpen, setReportBugModalOpen] = useState(false);

  //updates profile picture with user set profile picture
  async function setPicture() {
    const uri = await getProfilePicture();
    if (uri && uri !== '') {
      setProfileURI(uri);
    }
  }
  //updates name with user set name
  async function setUserName() {
    setName(await getProfileName());
  }

  useEffect(() => {
    (async () => {
      setPicture();
      setUserName();
    })();
  }, [updatedCounter]);

  function setUpdated(updated: boolean) {
    if (updated) {
      setUpdatedCounter(updatedCounter + 1);
    }
    setEditingName(false);
  }
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setPicture();
      })();
    }, []),
  );
  return (
    <SafeAreaView style={styles.profileScreen}>
      <ChatBackground />
      <BackTopbar />
      <View style={styles.profile}>
        <View style={styles.profilePictureHitbox}>
          <GenericAvatar profileUri={profileURI} avatarSize="medium" />
          <Pressable
            style={styles.updatePicture}
            onPress={() => {
              navigation.navigate('EditAvatar');
            }}>
            <EditCameraIcon />
          </Pressable>
        </View>
        <View style={styles.nicknameArea}>
          <NumberlessSemiBoldText
            style={styles.nickname}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {name}
          </NumberlessSemiBoldText>
          <View style={styles.nicknameEditBox}>
            <Pressable
              style={styles.nicknameEditHitbox}
              onPress={() => setEditingName(true)}>
              <EditIcon />
            </Pressable>
          </View>
        </View>
      </View>
      <Pressable
        style={styles.reportIssueButton}
        onPress={() => setReportBugModalOpen(p => !p)}>
        <Text style={styles.reportIssueText}>Report Issue</Text>
      </Pressable>

      <GenericModal
        visible={editingName}
        onClose={() => {
          setUpdated(p => !p);
        }}>
        <UpdateNamePopup setUpdated={setUpdated} initialName={name} />
      </GenericModal>

      <GenericModal
        visible={reportbugModalOpen}
        onClose={() => {
          setReportBugModalOpen(p => !p);
        }}>
        <ReportIssueModal
          setReportBugModalOpen={setReportBugModalOpen}
          reportbugModalOpen={reportbugModalOpen}
        />
      </GenericModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileScreen: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  profile: {
    width: '100%',
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
    padding: 10,
  },
  profilePic: {
    width: 132,
    height: 132,
    borderRadius: 44,
    marginBottom: 10,
    marginRight: 10,
  },
  nicknameArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  nickname: {
    fontSize: 19,
    color: 'black',
    overflow: 'hidden',
    width: '60%',
    textAlign: 'center',
  },
  nicknameEditBox: {
    width: '100%',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  nicknameEditHitbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nicknameEdit: {
    width: 24,
    height: 24,
  },
  empty: {
    width: 40,
    height: 40,
  },
  popUpArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  popupPosition: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
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
  reportIssueButton: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#547CEF',
    height: 55,
    width: 250,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportIssueText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  cards: {
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default MyProfile;
