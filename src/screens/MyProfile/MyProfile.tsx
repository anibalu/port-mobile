/**
 * The screen to view one's own profile
 * screen Id: 8
 */
import EditCameraIcon from '@assets/icons/EditCamera.svg';
import EditIcon from '@assets/icons/Pencil.svg';
import ChatBackground from '@components/ChatBackground';
import {PortColors, screen} from '@components/ComponentUtils';
import {GenericAvatar} from '@components/GenericAvatar';
import {GenericButton} from '@components/GenericButton';
import GenericModal from '@components/GenericModal';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import UpdateNamePopup from '@components/UpdateNamePopup';
import {AVATAR_ARRAY, DEFAULT_NAME} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getProfileName, getProfilePictureUri} from '@utils/Profile';
import React, {ReactNode, useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import ReportIssueModal from '../BugReporting/ReportIssueModal';
import PermissionIconInactive from '@assets/permissions/permissions-inactive.svg';
import GreyArrowRight from '@assets/icons/GreyArrowRight.svg';
import GenericTopBar from '@components/GenericTopBar';

type Props = NativeStackScreenProps<AppStackParamList, 'MyProfile'>;

function MyProfile({navigation}: Props): ReactNode {
  const [profileURI, setProfileURI] = useState(AVATAR_ARRAY[0]);
  const [name, setName] = useState<string>(DEFAULT_NAME);
  const [updatedCounter, setUpdatedCounter] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [reportbugModalOpen, setReportBugModalOpen] = useState(false);

  //updates profile picture with user set profile picture
  async function setPicture(): Promise<void> {
    const uri = await getProfilePictureUri();
    if (uri && uri !== '') {
      setProfileURI(uri);
    }
  }
  //updates name with user set name
  async function setUserName(): Promise<void> {
    const fetchedName = await getProfileName();
    setName(fetchedName ? fetchedName : DEFAULT_NAME);
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
      <GenericTopBar
        onBackPress={() => navigation.goBack()}
        title="My Profile"
      />
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
          <NumberlessText
            fontSizeType={FontSizeType.xl}
            fontType={FontType.sb}
            ellipsizeMode="tail"
            style={{maxWidth: '80%'}}
            numberOfLines={1}>
            {name}
          </NumberlessText>
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
        style={styles.tileCardStyle}
        onPress={() => {
          navigation.navigate('Presets');
        }}>
        <PermissionIconInactive
          style={{
            padding: 13,
            borderRadius: 12,
            // backgroundColor: PortColors.primary.blue.app,
          }}
        />
        <NumberlessText
          style={{textAlign: 'left', marginLeft: 18, flex: 1}}
          fontSizeType={FontSizeType.l}
          fontType={FontType.rg}>
          Permission presets
        </NumberlessText>
        <GreyArrowRight style={{marginRight: 18}} />
      </Pressable>

      <GenericButton
        buttonStyle={styles.reportIssueButton}
        onPress={() => setReportBugModalOpen(p => !p)}>
        Report Issue
      </GenericButton>

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
        <ReportIssueModal setReportBugModalOpen={setReportBugModalOpen} />
      </GenericModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileScreen: {
    alignItems: 'center',
  },
  profile: {
    width: screen.width,
    backgroundColor: PortColors.primary.white,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  nicknameEditBox: {
    right: 0,
    position: 'absolute',
  },
  nicknameEditHitbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updatePicture: {
    width: 40,
    height: 40,
    backgroundColor: PortColors.primary.blue.app,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  reportIssueButton: {
    position: 'absolute',
    bottom: 30,
    height: 60,
    width: 250,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileCardStyle: {
    backgroundColor: PortColors.primary.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 16,
    marginHorizontal: 24,
    padding: 10,
    borderRadius: 16,
  },
});

export default MyProfile;
