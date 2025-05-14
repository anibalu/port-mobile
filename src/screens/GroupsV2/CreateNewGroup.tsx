import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import PrimaryButton from '@components/Buttons/PrimaryButton';
import GradientCard from '@components/Cards/GradientCard';
import { useColors } from '@components/colorGuide';
import { screen } from '@components/ComponentUtils';
import { GradientScreenView } from '@components/GradientScreenView';
import SimpleInput from '@components/Inputs/SimpleInput';
import { AvatarBox } from '@components/Reusable/AvatarBox/AvatarBox';
import EditAvatar from '@components/Reusable/BottomSheets/EditAvatar';
import ErrorBottomSheet from '@components/Reusable/BottomSheets/ErrorBottomSheet';
import LargeTextInput from '@components/Reusable/Inputs/LargeTextInput';
import { Size, Spacing } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';
import TopBarDescription from '@components/Text/TopBarDescription';

import {
  DEFAULT_GROUP_PROFILE_AVATAR_INFO,
  safeModalCloseDuration,
} from '@configs/constants';

import { AppStackParamList } from '@navigation/AppStack/AppStackTypes';

import Group from '@utils/Groups/GroupClass';
import { FileAttributes } from '@utils/Storage/StorageRNFS/interfaces';
import { wait } from '@utils/Time';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateNewGroup'>;

const CreateNewGroup = ({ navigation }: Props) => {
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
      const groupHandler = await Group.create(
        groupName.trim(),
        groupDescription.trim(),
        imageAttr.fileUri,
      );
      try {
        //These are non-essential steps in group creation.
        //uploads encrypted group picture
        await groupHandler.uploadGroupPicture();
      } catch (error) {
        console.log('error in group picture upload: ', error);
      }
      navigation.replace('InviteGroupMembers', { chatId: groupHandler.getChatId(), groupData: groupHandler.getGroupData(), fromNewGroup: true});
    } catch (error) {
      setErrorVisible(true);
      console.log('error in group creation: ', error);
    }
    setSetupLoading(false);
  };

  const scrollToBottom = async () => {
    if (scrollViewRef.current) {
      await wait(200);
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const Colors = useColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'EditCameraIcon',
      light: require('@assets/light/icons/EditCamera.svg').default,
      dark: require('@assets/dark/icons/EditCamera.svg').default,
    },
  ];
  const results = useSVG(svgArray);
  const EditCameraIcon = results.EditCameraIcon;
  return (
    <GradientScreenView
      color={Colors}
      title="Create a new group"
      onBackPress={() => navigation.goBack()}
      modifyNavigationBarColor={true}
      bottomNavigationBarColor={Colors.black}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContainer}>
          <TopBarDescription
            theme={Colors.theme}
            description="Create a new group to chat with your friends and family."
          />
          <View style={styles.scrollableElementsParent}>
            <GradientCard style={{ paddingHorizontal: Spacing.m }}>
              <View style={styles.profilePictureHitbox}>
                <AvatarBox
                  profileUri={imageAttr.fileUri}
                  avatarSize="m"
                  onPress={() => {
                    setOpenEditAvatarModal(p => !p);
                  }}
                />
                <Pressable style={styles.updatePicture} onPress={() => {
                  setOpenEditAvatarModal(p => !p);
                }}>
                  <EditCameraIcon width={20} height={20} />
                </Pressable>
              </View>
              <SimpleInput
                setText={setGroupName}
                text={groupName}
                placeholderText="Group name"
              />
              <View style={{ height: Spacing.s }} />
              <LargeTextInput
                showLimit={true}
                setText={setGroupDescription}
                text={groupDescription}
                placeholderText="Add a description"
                maxLength={250}
                scrollToFocus={scrollToBottom}
              />
            </GradientCard>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          theme={Colors.theme}
          onClick={onCreatePressed}
          text="Create group"
          disabled={groupName.trim().length <= 0}
          isLoading={setupLoading}
        />
      </View>
      <EditAvatar
        visible={openEditAvatarModal}
        onSave={onSavePicture}
        localImageAttr={imageAttr}
        setLocalImageAttr={setImageAttr}
        onClose={() => {
          setOpenEditAvatarModal(false);
        }}
      />
      <ErrorBottomSheet
        visible={errorVisible}
        onTryAgain={onCreatePressed}
        title="Failed to create new group"
        onClose={() => setErrorVisible(false)}
        description="Please ensure you're connected to the internet to create a new group."
      />
    </GradientScreenView>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      width: screen.width,
      backgroundColor: colors.background,
      paddingHorizontal: Spacing.l,
    },
    profilePictureHitbox: {
      marginVertical: Spacing.l,
      paddingHorizontal: Spacing.xl,
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      alignSelf: 'center',
    },
    updatePicture: {
      width: Size.xl,
      height: Size.xl,
      backgroundColor: colors.purple,
      position: 'absolute',
      bottom: -Spacing.s,
      right: Spacing.l,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: Spacing.l,
    },
    scrollContainer: {
      backgroundColor: colors.background,
    },
    scrollableElementsParent: {
      marginTop: -Spacing.xxl,
      paddingHorizontal: Spacing.l,
      paddingBottom: 200,
      gap: Spacing.l,
    },
    footer: {
      backgroundColor: colors.surface,
      padding: Spacing.l,
    },
  });

export default CreateNewGroup;
