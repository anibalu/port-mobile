import {PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import EditAvatar from '@components/Reusable/BottomSheets/EditAvatar';
import ThemeBottomsheet from '@components/Reusable/BottomSheets/ThemeBottomsheet';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {SafeAreaView} from '@components/SafeAreaView';
import GenericTitle from '@components/Text/GenericTitle';
import {DEFAULT_NAME, DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';
import {createSecureDataBackup} from '@utils/Backup/backupUtils';
import {updateProfileName} from '@utils/Profile';
import {setNewProfilePicture} from '@utils/ProfilePicture';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import {ThemeType} from '@utils/Themes';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useTheme} from 'src/context/ThemeContext';

const NewProfileScreen = () => {
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
  const [openEditAvatarModal, setOpenEditAvatarModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(
    ThemeType.default,
  );
  const [openThemeBottomSheet, setOpenThemeBottomSheet] = useState(false);
  const colors = DynamicColors();
  const styles = styling(colors);

  const {themeValue} = useTheme();
  const navigation = useNavigation();

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
  ];
  const results = useDynamicSVG(svgArray);
  const DefaultPermissions = results.DefaultPermissions;
  const Blocked = results.Blocked;
  const Legal = results.Legal;
  const Backup = results.Backup;
  const Appearance = results.Appearance;
  const AngleRight = results.AngleRight;
  const RoundPencil = results.RoundPencil;

  async function onSavePicture(newProfilePicAttr: FileAttributes) {
    await setNewProfilePicture(newProfilePicAttr);
  }

  const onSaveName = async () => {
    await updateProfileName(processedName);
  };
  const onBackupPress = async () => {
    await createSecureDataBackup();
  };

  useMemo(() => {
    onSaveName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedName]);
  return (
    <>
      <CustomStatusBar backgroundColor={colors.primary.surface} />
      <SafeAreaView>
        <GenericTitle title="New Profile" />
        <ScrollView contentContainerStyle={styles.profile}>
          <AvatarBox
            profileUri={profilePicAttr.fileUri}
            avatarSize="m"
            onPress={() => setOpenEditAvatarModal(true)}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: PortSpacing.tertiary.uniform,
            }}>
            <NumberlessText
              fontSizeType={FontSizeType.xl}
              fontType={FontType.sb}
              textColor={colors.text.primary}>
              {processedName}
            </NumberlessText>
            <RoundPencil width={20} height={20} />
          </View>
          <NumberlessText
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}
            textColor={colors.text.subtitle}
            style={{
              textAlign: 'center',
              marginTop: PortSpacing.tertiary.uniform,
            }}>
            Your profile picture and name is end to end encrypted. Neither Port
            nor your connections ever see your data in an unencrypted state.
          </NumberlessText>

          <Pressable
            onPress={() => navigation.navigate('DefaultPermissionsScreen')}
            style={styles.row}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: PortSpacing.secondary.uniform,
              }}>
              <DefaultPermissions />
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontType={FontType.md}
                textColor={colors.text.primary}>
                Default Permissions
              </NumberlessText>
            </View>
            <AngleRight />
          </Pressable>
          <View style={styles.line} />
          <Pressable
            onPress={() => setOpenThemeBottomSheet(true)}
            style={styles.row}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: PortSpacing.secondary.uniform,
              }}>
              <Appearance />
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontType={FontType.md}
                textColor={colors.text.primary}>
                Appearance
              </NumberlessText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: PortSpacing.secondary.uniform,
              }}>
              <NumberlessText
                style={{
                  backgroundColor: colors.lowAccentColors.tealBlue,
                  paddingHorizontal: PortSpacing.tertiary.uniform,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
                fontSizeType={FontSizeType.m}
                fontType={FontType.md}
                textColor={colors.boldAccentColors.tealBlue}>
                {selectedTheme}
              </NumberlessText>
              <AngleRight />
            </View>
          </Pressable>
          <View style={styles.line} />
          <Pressable onPress={onBackupPress} style={styles.row}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: PortSpacing.secondary.uniform,
              }}>
              <Backup />
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontType={FontType.md}
                textColor={colors.text.primary}>
                Backup
              </NumberlessText>
            </View>
            <AngleRight />
          </Pressable>
          <View style={styles.line} />
          <Pressable
            onPress={() => navigation.push('BlockedContacts')}
            style={styles.row}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: PortSpacing.secondary.uniform,
              }}>
              <Blocked />
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontType={FontType.md}
                textColor={colors.text.primary}>
                Blocked Contacts
              </NumberlessText>
            </View>
            <AngleRight />
          </Pressable>
          <View style={styles.line} />
          <Pressable
            onPress={() => navigation.push('HelpScreen')}
            style={styles.row}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: PortSpacing.secondary.uniform,
              }}>
              <Legal />
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontType={FontType.md}
                textColor={colors.text.primary}>
                Legal
              </NumberlessText>
            </View>
            <AngleRight />
          </Pressable>

          <View style={styles.bottomContainer}>
            <PrimaryButton
              disabled={false}
              isLoading={false}
              onClick={() => navigation.push('GiveUsFeedbackScreen')}
              buttonText="Give us feedback"
              primaryButtonColor={'p'}
            />
          </View>
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
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    profile: {
      backgroundColor: colors.primary.surface,
      flexDirection: 'column',
      alignItems: 'center',
      paddingVertical: PortSpacing.secondary.bottom,
      paddingHorizontal: PortSpacing.secondary.uniform,
      borderTopColor: colors.primary.stroke,
      borderTopWidth: 0.5,
      flex: 1,
    },
    bottomContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      position: 'absolute',
      bottom: PortSpacing.primary.uniform,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: PortSpacing.secondary.uniform,
    },
    line: {
      borderBottomColor: colors.primary.stroke,
      borderBottomWidth: 0.5,
      width: '100%',
      marginTop: PortSpacing.tertiary.uniform,
    },
  });

export default NewProfileScreen;
