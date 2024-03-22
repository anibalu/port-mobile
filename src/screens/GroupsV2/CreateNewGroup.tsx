import {
  PortColors,
  PortSpacing,
  isIOS,
  screen,
} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {SafeAreaView} from '@components/SafeAreaView';
import React, {useState} from 'react';
import {KeyboardAvoidingView, ScrollView, StyleSheet, View} from 'react-native';
import Cross from '@assets/icons/BlackCross.svg';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {useNavigation} from '@react-navigation/native';
import SimpleInput from '@components/Reusable/Inputs/SimpleInput';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {GenericButton} from '@components/GenericButton';
import {FileAttributes} from '@utils/Storage/interfaces';
import {DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';
import EditCameraIcon from '@assets/icons/EditCamera.svg';
import EditAvatar from '@components/Reusable/BottomSheets/EditAvatar';
import LargeTextInput from '@components/Reusable/Inputs/LargeTextInput';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import Group from '@utils/Groups/Group';
import {fetchNewPorts} from '@utils/Ports';
import {useErrorModal} from 'src/context/ErrorModalContext';

const CreateNewGroup = () => {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [imageAttr, setImageAttr] = useState<FileAttributes>(
    DEFAULT_PROFILE_AVATAR_INFO,
  );
  //controls opening of bottom sheet to edit profile picture
  const [openEditAvatarModal, setOpenEditAvatarModal] = useState(false);
  async function onSavePicture(profilePicAttr: FileAttributes) {
    console.log(profilePicAttr);
  }
  const [setupLoading, setSetupLoading] = useState(false);
  const {unableToCreateGroupError} = useErrorModal();

  const generateLinks = async () => {
    await fetchNewPorts(groupHandler.getGroupIdNotNull());
  };
  const groupHandler = new Group();

  const onCreatePressed = async () => {
    setSetupLoading(true);
    try {
      await groupHandler.createGroup(
        groupName.trim(),
        groupDescription.trim(),
        null,
      );
      //generate ports for group
      await generateLinks();
      navigation.navigate('NewGroupPort', {
        groupId: groupHandler.getGroupIdNotNull(),
      });
      console.log('group has been created', groupHandler.getGroupIdNotNull());
    } catch (error) {
      unableToCreateGroupError();
      console.log('error in group creation: ', error);
      return false;
    } finally {
      setSetupLoading(false);
    }
  };
  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView style={{backgroundColor: PortColors.background}}>
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
            <View style={{marginTop: PortSpacing.tertiary.top, width: '100%'}}>
              <LargeTextInput
                showLimit={true}
                inputStyle={{backgroundColor: 'white'}}
                setText={setGroupDescription}
                text={groupDescription}
                placeholderText="Add a description"
                maxLength={250}
              />
            </View>
          </ScrollView>
          <View
            style={{
              marginHorizontal: PortSpacing.secondary.uniform,
            }}>
            <PrimaryButton
              primaryButtonColor="b"
              onClick={() => onCreatePressed()}
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
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: screen.width,
    backgroundColor: '#F2F4F7',
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
    backgroundColor: PortColors.primary.blue.app,
    position: 'absolute',
    bottom: -8,
    right: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9,
  },
});

export default CreateNewGroup;
