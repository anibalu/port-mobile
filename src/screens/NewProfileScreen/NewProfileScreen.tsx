import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import { useColors } from '@components/colorGuide';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import EditAvatar from '@components/Reusable/BottomSheets/EditAvatar';
import EditName from '@components/Reusable/BottomSheets/EditName';
import ThemeBottomsheet from '@components/Reusable/BottomSheets/ThemeBottomsheet';
import {SafeAreaView} from '@components/SafeAreaView';
import { Spacing } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';
import GenericTitle from '@components/Text/GenericTitle';

import {DEFAULT_NAME, DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';

import { BottomNavStackParamList } from '@navigation/AppStack/BottomNavStack/BottomNavStackTypes';

import {createSecureDataBackup} from '@utils/Backup/backupUtils';
import {getProfileInfo, updateProfileName} from '@utils/Profile';
import {setNewProfilePicture} from '@utils/ProfilePicture';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import {ThemeType} from '@utils/Themes';



import {useTheme} from 'src/context/ThemeContext';

type Props = NativeStackScreenProps<BottomNavStackParamList, 'Settings'>;


const NewProfileScreen = ({navigation}:Props) => {
  const profile = useSelector(state => state.profile.profile);
  const {name, avatar} = useMemo(() => {
    getProfileInfo().then((profile) => {
      console.log('profile', profile);
    });
    return {
      name: profile?.name || DEFAULT_NAME,
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);
  const processedName: string = name || DEFAULT_NAME;
  const processedAvatar: FileAttributes = avatar || DEFAULT_PROFILE_AVATAR_INFO;

  const [profilePicAttr, setProfilePicAttr] =
    useState<FileAttributes>(processedAvatar);
  const [openEditAvatarModal, setOpenEditAvatarModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(
    ThemeType.default,
  );
  const [openThemeBottomSheet, setOpenThemeBottomSheet] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState<string>(processedName);
  const colors = useColors()
  const styles = styling(colors);

  const {themeValue} = useTheme();

  useEffect(() => {
    setSelectedTheme(themeValue); 
  }, [themeValue]);

  const svgArray = [
    {
      assetName: 'DefaultPermissions',
      light: require('@assets/light/icons/Profile/DefaultPermissions.svg')
        .default,
      dark: require('@assets/dark/icons/Profile/DefaultPermissions.svg')
        .default,
    },
    {
      assetName: 'Blocked',
      light: require('@assets/light/icons/Profile/Blocked.svg').default,
      dark: require('@assets/dark/icons/Profile/Blocked.svg').default,
    },
    {
      assetName: 'Legal',
      light: require('@assets/light/icons/Profile/Legal.svg').default,
      dark: require('@assets/dark/icons/Profile/Legal.svg').default,
    },
    {
      assetName: 'Backup',
      light: require('@assets/light/icons/Profile/Backup.svg').default,
      dark: require('@assets/dark/icons/Profile/Backup.svg').default,
    },
    {
      assetName: 'Appearance',
      light: require('@assets/light/icons/Profile/Apperance.svg').default,
      dark: require('@assets/dark/icons/Profile/Apperance.svg').default,
    },
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
    {
      assetName: 'RoundPencil',
      light: require('@assets/light/icons/RoundPencil.svg').default,
      dark: require('@assets/dark/icons/RoundPencil.svg').default,
    },
    {
      assetName: 'Account',
      light: require('@assets/light/icons/Profile/Account.svg').default,
      dark: require('@assets/dark/icons/Profile/Account.svg').default,
    },
  ];
  const results = useSVG(svgArray);
  const DefaultPermissions = results.DefaultPermissions;
  const Blocked = results.Blocked;
  const Legal = results.Legal;
  const Backup = results.Backup;
  const Appearance = results.Appearance;
  const AngleRight = results.AngleRight;
  const RoundPencil = results.RoundPencil;
  const Account = results.Account;

  async function onSavePicture(newProfilePicAttr: FileAttributes) {
    await setNewProfilePicture(newProfilePicAttr);
  }

  const onSaveName = async (newName: string) => {
    await updateProfileName(newName);
  };
  const onBackupPress = async () => {
    await createSecureDataBackup();
  };
  
  return (
    <>
      <CustomStatusBar backgroundColor={colors.background2} />
      <SafeAreaView   backgroundColor={colors.background2} >
        <GenericTitle title="Profile" />
        <ScrollView contentContainerStyle={styles.profile}>
          <AvatarBox
            profileUri={profilePicAttr.fileUri}
            avatarSize="m"
            onPress={() => setOpenEditAvatarModal(true)}
          />
          <Pressable
          onPress={() => setEditingName(true)}
            style={styles.bottomCard}>
            <NumberlessText
              fontSizeType={FontSizeType.xl}
              fontWeight={FontWeight.sb}
              textColor={colors.text.title}>
              {newName}
            </NumberlessText>
            <RoundPencil   width={20} height={20} />
          </Pressable>
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontWeight={FontWeight.rg}
            textColor={colors.text.subtitle}
            style={styles.bottomCard}>
            Your profile picture and name is end to end encrypted. Neither Port
            nor your connections ever see your data in an unencrypted state.
          </NumberlessText>

          <Pressable
            onPress={() => navigation.navigate('DefaultPermissionsScreen')}
            style={styles.row}>
            <View
              style={styles.card}>
              <DefaultPermissions />
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontWeight={FontWeight.md}
                textColor={colors.text.title}>
                Default Permissions
              </NumberlessText>
            </View>
            <AngleRight />
          </Pressable>
          <Pressable
            onPress={() => setOpenThemeBottomSheet(true)}
            style={styles.row}>
            <View
                style={styles.card}>
              <Appearance />
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontWeight={FontWeight.md}
                textColor={colors.text.title}>
                Appearance
              </NumberlessText>
            </View>
            
            <View
                 style={styles.card}>
              <NumberlessText
                style={{
                  backgroundColor: colors.lowAccentColors.tealBlue,
                  paddingHorizontal: Spacing.s,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
                fontSizeType={FontSizeType.m}
                fontWeight={FontWeight.md}
                textColor={colors.boldAccentColors.tealBlue}>
                {selectedTheme}
              </NumberlessText>
              <AngleRight />
            </View>
          </Pressable>
          <Pressable onPress={onBackupPress} style={styles.row}>
            <View
               style={styles.card}>
              <Backup />
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontWeight={FontWeight.md}
                textColor={colors.text.title}>
                Backup
              </NumberlessText>
            </View>
            <AngleRight />
          </Pressable>
          <Pressable
            onPress={() => navigation.push('BlockedContacts')}
            style={styles.row}>
            <View
                style={styles.card}>
              <Blocked />
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontWeight={FontWeight.md}
                textColor={colors.text.title}>
                Blocked Contacts
              </NumberlessText>
            </View>
            <AngleRight />
          </Pressable>
          <Pressable
            onPress={() => navigation.push('HelpScreen')}
            style={styles.row}>
            <View
                style={styles.card}>
              <Legal />
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontWeight={FontWeight.md}
                textColor={colors.text.title}>
                Legal
              </NumberlessText>
            </View>
            <AngleRight />
          </Pressable>
          <Pressable
            onPress={() => navigation.push('AccountSettings')}
            style={styles.row}>
            <View
               style={styles.card}>
              <Account />
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontWeight={FontWeight.md}
                textColor={colors.text.title}>
                Account settings
              </NumberlessText>
            </View>
            <AngleRight />
          </Pressable>

       
          <EditAvatar
            localImageAttr={profilePicAttr}
            setLocalImageAttr={setProfilePicAttr}
            visible={openEditAvatarModal}
            onSave={onSavePicture}
            onClose={() => {
              setOpenEditAvatarModal(false);
            }}
          />
        <ThemeBottomsheet
            selected={selectedTheme}
            setSelected={setSelectedTheme}
            setShowThemeBottomsheet={setOpenThemeBottomSheet}
            showThemeBottomsheet={openThemeBottomSheet}
          />

        <EditName
          title={'Edit your name'}
          visible={editingName}
          name={newName}
          onSave={onSaveName}
          setName={setNewName}
          onClose={() => {
            setEditingName(false);
          }}
        />
              <View style={styles.bottomContainer}>
            <PrimaryButton
              disabled={false}
              isLoading={false}
              onClick={() => navigation.push('GiveUsFeedbackScreen')}
              text="Give us feedback"
              theme={colors.theme}
            />
          </View>
        </ScrollView>
  
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    profile: {
      backgroundColor: colors.background2,
      flexDirection: 'column',
      alignItems: 'center',
      paddingVertical: Spacing.l,
      paddingHorizontal:  Spacing.l,
      flex: 1,
    },
    bottomContainer: {
      width:'100%'
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingVertical: Spacing.m,
      borderBottomColor: colors.stroke,
      borderBottomWidth: 0.5,
    },
bottomCard:{
     flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.s,
},
card:{
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.l
}
  });

export default NewProfileScreen;
