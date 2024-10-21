import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {SafeAreaView} from '@components/SafeAreaView';
import React, {useRef, useState} from 'react';
import {KeyboardAvoidingView, ScrollView, StyleSheet, View} from 'react-native';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {useNavigation} from '@react-navigation/native';
import SimpleInput from '@components/Reusable/Inputs/SimpleInput';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {GenericButton} from '@components/GenericButton';
import {
  DEFAULT_GROUP_PROFILE_AVATAR_INFO,
  safeModalCloseDuration,
} from '@configs/constants';
import EditAvatar from '@components/Reusable/BottomSheets/EditAvatar';
import LargeTextInput from '@components/Reusable/Inputs/LargeTextInput';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import Group from '@utils/Groups/Group';
import {fetchNewPorts} from '@utils/Ports';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';
import {wait} from '@utils/Time';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

const CreateNewGroup = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [imageAttr, setImageAttr] = useState<FileAttributes>(
    DEFAULT_GROUP_PROFILE_AVATAR_INFO,
  );
  //controls error bottom sheet
  const [errorVisible, setErrorVisible] = useState(false);
  //controls opening of bottom sheet to edit profile picture
  const [openEditAvatarModal, setOpenEditAvatarModal] = useState(false);
  async function onSavePicture(profilePicAttr: FileAttributes) {
    console.log(profilePicAttr);
  }
  const [setupLoading, setSetupLoading] = useState(false);

  const onCreatePressed = async () => {
    if (errorVisible) {
      setErrorVisible(false);
      await wait(safeModalCloseDuration);
    }
    setSetupLoading(true);
    try {
      // throw new Error('Groups unsupported at the moment');
      const groupHandler = new Group();
      await groupHandler.createGroup(
        groupName.trim(),
        groupDescription.trim(),
        imageAttr.fileUri,
      );
      //generate ports for group
      await fetchNewPorts(groupHandler.getGroupIdNotNull());
      //uploads encrypted group picture
      await groupHandler.uploadGroupPicture();
      navigation.goBack();
    } catch (error) {
      setErrorVisible(true);
      console.log('error in group creation: ', error);
    }
    setSetupLoading(false);
  };
  const scrollToBottom = async () => {
    if (scrollViewRef.current) {
      await wait(200);
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  };

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'Cross',
      light: require('@assets/light/icons/Cross.svg').default,
      dark: require('@assets/dark/icons/Cross.svg').default,
    },
    {
      assetName: 'EditCameraIcon',
      light: require('@assets/light/icons/EditCamera.svg').default,
      dark: require('@assets/dark/icons/EditCamera.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const Cross = results.Cross;
  const EditCameraIcon = results.EditCameraIcon;
  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={Colors.primary.surface}
      />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <TopBarWithRightIcon
          onIconRightPress={() => navigation.goBack()}
          IconRight={Cross}
          heading="Create new group"
        />
        <KeyboardAvoidingView
          style={styles.screen}
          behavior={isIOS ? 'padding' : 'height'}
          keyboardVerticalOffset={isIOS ? 50 : 0}>
          <ScrollView
            ref={scrollViewRef}
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            <View style={styles.profilePictureHitbox}>
              <AvatarBox
                profileUri={imageAttr.fileUri}
                avatarSize="m"
                onPress={() => {
                  setOpenEditAvatarModal(p => !p);
                }}
              />
              <GenericButton
                IconLeft={EditCameraIcon}
                iconSize={20}
                buttonStyle={styles.updatePicture}
                onPress={() => {
                  setOpenEditAvatarModal(p => !p);
                }}
              />
            </View>
            <SimpleInput
              setText={setGroupName}
              text={groupName}
              placeholderText="Group name"
            />
            <View style={{height: PortSpacing.tertiary.uniform}} />
            <LargeTextInput
              showLimit={true}
              setText={setGroupDescription}
              text={groupDescription}
              placeholderText="Add a description"
              maxLength={250}
              scrollToFocus={scrollToBottom}
            />
          </ScrollView>
          <View
            style={{
              paddingVertical: PortSpacing.secondary.uniform,
            }}>
            <PrimaryButton
              primaryButtonColor="b"
              onClick={onCreatePressed}
              buttonText="Create group"
              disabled={groupName.length <= 0}
              isLoading={setupLoading}
            />
          </View>
        </KeyboardAvoidingView>

        <EditAvatar
          visible={openEditAvatarModal}
          onSave={onSavePicture}
          localImageAttr={imageAttr}
          setLocalImageAttr={setImageAttr}
          onClose={() => {
            setOpenEditAvatarModal(false);
          }}
        />
      </SafeAreaView>
      <ErrorBottomSheet
        visible={errorVisible}
        onTryAgain={onCreatePressed}
        title="Failed to create new group"
        onClose={() => setErrorVisible(false)}
        description="Please ensure you're connected to the internet to create a new group."
      />
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      width: screen.width,
      backgroundColor: colors.primary.background,
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
    profilePictureHitbox: {
      marginTop: PortSpacing.primary.top,
      marginBottom: PortSpacing.primary.bottom,
      paddingHorizontal: PortSpacing.secondary.uniform,
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      alignSelf: 'center',
    },
    updatePicture: {
      width: 32,
      height: 32,
      backgroundColor: colors.primary.accent,
      position: 'absolute',
      bottom: -4,
      right: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 9,
    },
  });

export default CreateNewGroup;
