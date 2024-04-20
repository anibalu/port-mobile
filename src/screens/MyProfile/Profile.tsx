/**
 * The screen to view one's own profile
 * screen Id: 8
 */
import EditCameraIcon from '@assets/icons/EditCamera.svg';

import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import {
  APP_VERSION,
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {setNewProfilePicture, updateProfileName} from '@utils/Profile';
import React, {ReactNode, useMemo, useState} from 'react';
import {StyleSheet, View, Pressable} from 'react-native';
import EditAvatar from '@components/Reusable/BottomSheets/EditAvatar';
import {FileAttributes} from '@utils/Storage/interfaces';

import BackTopbar from '@components/Reusable/TopBars/BackTopBar';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';

import EditName from '@components/Reusable/BottomSheets/EditName';
import EditableInputCard from '@components/Reusable/Cards/EditableInputCard';
import {CustomStatusBar} from '@components/CustomStatusBar';
import BackupCard from '@components/BackupCard';

type Props = NativeStackScreenProps<AppStackParamList, 'MyProfile'>;

function MyProfile({route, navigation}: Props): ReactNode {
  const {name, avatar} = route.params;
  const processedName: string = name || DEFAULT_NAME;
  const processedAvatar: FileAttributes = avatar || DEFAULT_PROFILE_AVATAR_INFO;

  const [profilePicAttr, setProfilePicAttr] =
    useState<FileAttributes>(processedAvatar);
  const [newName, setNewName] = useState<string>(processedName);
  const [editingName, setEditingName] = useState(false);
  const [openEditAvatarModal, setOpenEditAvatarModal] = useState(false);

  async function onSavePicture(newProfilePicAttr: FileAttributes) {
    await setNewProfilePicture(newProfilePicAttr);
  }

  const onSaveName = async () => {
    await updateProfileName(newName);
    setEditingName(false);
  };

  useMemo(() => {
    onSaveName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newName]);

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.background}
      />
      <SafeAreaView style={styles.profileScreen}>
        <BackTopbar onBackPress={() => navigation.goBack()} />
        <View style={styles.profile}>
          <View style={{alignItems: 'center', width: '100%'}}>
            <View style={styles.profilePictureHitbox}>
              <AvatarBox
                profileUri={profilePicAttr.fileUri}
                avatarSize="m"
                onPress={() => setOpenEditAvatarModal(true)}
              />
              <Pressable
                onPress={() => setOpenEditAvatarModal(true)}
                style={styles.cameraIconWrapper}>
                <EditCameraIcon height={20} width={20} />
              </Pressable>
            </View>
            <View style={styles.mainContainer}>
              <EditableInputCard text={newName} setOpenModal={setEditingName} />
              <NumberlessText
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}
                textColor={PortColors.subtitle}
                style={{
                  textAlign: 'center',
                  marginTop: PortSpacing.secondary.uniform,
                }}>
                Your profile picture and name is shared with your contacts using
                end-to-end encryption.
              </NumberlessText>
              <BackupCard />
              <NumberlessText
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}
                textColor={PortColors.subtitle}
                style={{
                  textAlign: 'center',
                  marginTop: PortSpacing.secondary.uniform,
                }}>
                To restore from a backup, install a new copy of the Port app.
                Open the app, tap 'Restore backup' and then locate the backup
                file.
              </NumberlessText>
            </View>
          </View>
          <View style={styles.bottomContainer}>
            <NumberlessText
              style={styles.versionText}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              version {APP_VERSION}
            </NumberlessText>

            <PrimaryButton
              disabled={false}
              isLoading={false}
              onClick={() => navigation.navigate('GiveUsFeedbackScreen')}
              // onClick={() => setReportBugModalOpen(p => !p)}
              buttonText="Give us feedback"
              primaryButtonColor={'b'}
            />
          </View>
        </View>

        <EditName
          title={'Edit your Name'}
          visible={editingName}
          name={newName}
          setName={setNewName}
          onClose={() => {
            setEditingName(false);
          }}
        />

        <EditAvatar
          localImageAttr={profilePicAttr}
          setLocalImageAttr={setProfilePicAttr}
          visible={openEditAvatarModal}
          onSave={onSavePicture}
          onClose={() => {
            setOpenEditAvatarModal(false);
          }}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  profileScreen: {
    alignItems: 'center',
    backgroundColor: PortColors.background,
  },
  mainContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  profile: {
    flex: 1,
    width: screen.width,
    backgroundColor: PortColors.background,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: PortSpacing.secondary.bottom,
    paddingHorizontal: PortSpacing.secondary.uniform,
  },
  bottomContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  profilePictureHitbox: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: PortSpacing.primary.bottom,
  },
  infoText: {
    fontFamily: FontType.rg,
    fontSize: FontSizeType.m,
    marginTop: PortSpacing.tertiary.top,
    textAlign: 'center',
    alignSelf: 'stretch',
    fontWeight: getWeight(FontType.rg),
    color: PortColors.subtitle,
    lineHeight: 15,
  },
  versionText: {
    color: PortColors.subtitle,
    padding: PortSpacing.secondary.bottom,
  },
  cameraIconWrapper: {
    width: 32,
    bottom: -8,
    right: -8,
    height: 32,
    backgroundColor: PortColors.primary.blue.app,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9,
  },
  profilePic: {
    width: 132,
    height: 132,
    borderRadius: 44,
    marginBottom: PortSpacing.tertiary.bottom,
    marginRight: PortSpacing.tertiary.right,
  },
});

export default MyProfile;
