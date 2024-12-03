/**
 * The screen to view one's own profile
 * screen Id: 8
 */

import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import {
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  TOPBAR_HEIGHT,
} from '@configs/constants';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {updateProfileName} from '@utils/Profile';
import {setNewProfilePicture} from '@utils/ProfilePicture';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {StyleSheet, View, Pressable, ScrollView} from 'react-native';
import EditAvatar from '@components/Reusable/BottomSheets/EditAvatar';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';

import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';

import EditName from '@components/Reusable/BottomSheets/EditName';
import EditableInputCard from '@components/Reusable/Cards/EditableInputCard';
import {CustomStatusBar} from '@components/CustomStatusBar';
import BackupCard from '@components/BackupCard';
import ThemeCard from '@components/ThemeCard';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {ThemeType} from '@utils/Themes';
import {useTheme} from 'src/context/ThemeContext';
import BlockedCard from '@components/BlockedCard';
import {useFocusEffect} from '@react-navigation/native';
import {getCountOfBlockedUsers} from '@utils/Storage/blockUsers';
import HelpCard from '@components/HelpCard';
import {BottomNavStackParamList} from '@navigation/BottomNavStackTypes';
import {useSelector} from 'react-redux';

type Props = NativeStackScreenProps<BottomNavStackParamList, 'MyProfile'>;

const MyProfile = ({navigation}: Props): ReactNode => {
  const profile = useSelector(state => state.profile.profile);
  const {name, avatar} = useMemo(() => {
    return {
      name: profile?.name || DEFAULT_NAME,
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);
  const processedName: string = name || DEFAULT_NAME;
  const processedAvatar: FileAttributes = avatar || DEFAULT_PROFILE_AVATAR_INFO;

  const [profilePicAttr, setProfilePicAttr] =
    useState<FileAttributes>(processedAvatar);
  const [newName, setNewName] = useState<string>(processedName);
  const [editingName, setEditingName] = useState(false);
  const [openEditAvatarModal, setOpenEditAvatarModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(
    ThemeType.default,
  );
  const colors = DynamicColors();
  const styles = styling(colors);

  const {themeValue} = useTheme();

  useEffect(() => {
    setSelectedTheme(themeValue);
  }, [themeValue]);

  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'EditCameraIcon',
      light: require('@assets/light/icons/EditCamera.svg').default,
      dark: require('@assets/dark/icons/EditCamera.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);

  const EditCameraIcon = results.EditCameraIcon;

  const [blockedContactsLength, setBlockedContactsLength] = useState(0);

  async function onSavePicture(newProfilePicAttr: FileAttributes) {
    await setNewProfilePicture(newProfilePicAttr);
  }

  const onSaveName = async () => {
    await updateProfileName(newName);
    setEditingName(false);
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setBlockedContactsLength(await getCountOfBlockedUsers());
      })();
    }, []),
  );

  useMemo(() => {
    onSaveName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newName]);

  return (
    <>
      <CustomStatusBar backgroundColor={colors.primary.background} />
      <SafeAreaView
        removeOffset={true}
        style={{
          alignItems: 'center',
          backgroundColor: colors.primary.background,
        }}>
        <ScrollView contentContainerStyle={styles.profile}>
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
                textColor={colors.text.subtitle}
                style={{
                  textAlign: 'center',
                  marginTop: PortSpacing.secondary.uniform,
                }}>
                Port servers don't see unencrypted versions of your name and
                profile picture.
              </NumberlessText>
              <ThemeCard
                selected={selectedTheme}
                setSelected={setSelectedTheme}
              />
              <BlockedCard listLength={blockedContactsLength} />
              <BackupCard />
              <HelpCard />
            </View>
          </View>
          <View style={styles.bottomContainer}>
            <PrimaryButton
              disabled={false}
              isLoading={false}
              onClick={() => navigation.push('GiveUsFeedbackScreen')}
              buttonText="Give us feedback"
              primaryButtonColor={'b'}
            />
          </View>
        </ScrollView>

        <EditName
          title={'Edit your name'}
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
};

const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    profile: {
      backgroundColor: colors.primary.background,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: PortSpacing.secondary.bottom,
      paddingTop: TOPBAR_HEIGHT,
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
    bottomContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: 20,
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
      color: colors.text.primary,
      lineHeight: 15,
    },
    versionText: {
      padding: PortSpacing.secondary.bottom,
    },
    cameraIconWrapper: {
      width: 32,
      bottom: -4,
      right: -4,
      height: 32,
      backgroundColor: colors.primary.accent,
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
