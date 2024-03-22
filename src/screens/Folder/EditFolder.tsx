import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {SafeAreaView} from '@components/SafeAreaView';
import CrossButton from '@assets/navigation/crossButton.svg';
import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import AdvanceSettingsCard from '@components/Reusable/PermissionCards/AdvanceSettingsCard';
import ChatSettingsCard from '@components/Reusable/PermissionCards/ChatSettingsCard';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {
  defaultFolderId,
  defaultFolderInfo,
  defaultPermissions,
} from '@configs/constants';
import {PermissionsStrict} from '@utils/ChatPermissions/interfaces';
import {
  applyFolderPermissions,
  deleteFolder,
  editFolderName,
  getFolderPermissions,
} from '@utils/ChatFolders';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '@navigation/AppStackTypes';
import EditName from '@components/Reusable/BottomSheets/EditName';
import EditableInputCard from '@components/Reusable/Cards/EditableInputCard';
import ConfirmationBottomSheet from '@components/Reusable/BottomSheets/ConfirmationBottomSheet';

type Props = NativeStackScreenProps<AppStackParamList, 'EditFolder'>;

const EditFolder = ({route, navigation}: Props) => {
  const {selectedFolder} = route.params;
  const [isEditFolderNameModalOpen, setIsEditFolderNameModalOpen] =
    useState(false);
  //sets folder name
  const [folderName, setFolderName] = useState<string>(selectedFolder.name);
  //set permissions
  const [permissions, setPermissions] = useState<PermissionsStrict>({
    ...defaultPermissions,
  });

  //load up folder permissions
  useEffect(() => {
    (async () => {
      setPermissions(await getFolderPermissions(selectedFolder.folderId));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveFolderName = async () => {
    await editFolderName(selectedFolder.folderId, folderName);
    setIsEditFolderNameModalOpen(false);
  };

  useMemo(() => {
    onSaveFolderName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderName]);

  const [openApplyToAllModal, setOpenApplyToAllModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView style={{backgroundColor: PortColors.background}}>
        <TopBarWithRightIcon
          onIconRightPress={() => {
            navigation.navigate('HomeTab', {
              selectedFolder: {...selectedFolder, name: folderName},
            });
          }}
          IconRight={CrossButton}
          heading={
            selectedFolder.folderId === defaultFolderId
              ? 'Primary folder settings'
              : 'Edit folder settings'
          }
        />
        {selectedFolder.folderId !== defaultFolderId && (
          <View
            style={{
              paddingHorizontal: PortSpacing.secondary.uniform,
              paddingBottom: PortSpacing.secondary.bottom,
              paddingTop: PortSpacing.tertiary.top,
              backgroundColor: PortColors.primary.white,
            }}>
            <EditableInputCard
              text={folderName}
              setOpenModal={setIsEditFolderNameModalOpen}
            />
            <EditName
              name={folderName}
              setName={setFolderName}
              visible={isEditFolderNameModalOpen}
              onClose={() => setIsEditFolderNameModalOpen(false)}
              title="Edit Folder Name"
              placeholderText="Folder name"
            />
          </View>
        )}

        <View style={styles.scrollViewContainer}>
          <ScrollView
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            <View
              style={{
                paddingTop: PortSpacing.secondary.top,
                paddingBottom: PortSpacing.secondary.uniform,
              }}>
              <NumberlessText
                style={{
                  color: PortColors.primary.blue.app,
                  marginBottom: PortSpacing.tertiary.bottom,
                }}
                fontSizeType={FontSizeType.l}
                fontType={FontType.rg}>
                Customize chats in this folder
              </NumberlessText>
              <NumberlessText
                style={{color: PortColors.subtitle}}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                These settings will apply to all chats in this folder. If you
                change settings for a specific chat later, those changes will
                take precedence for that chat.
              </NumberlessText>
            </View>
            <View style={styles.chatSettingsContainer}>
              <ChatSettingsCard
                permissionsId={selectedFolder.permissionsId}
                permissions={permissions}
                setPermissions={setPermissions}
              />
            </View>
            <View>
              <AdvanceSettingsCard
                permissionsId={selectedFolder.permissionsId}
                permissions={permissions}
                setPermissions={setPermissions}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <PrimaryButton
                isLoading={false}
                disabled={folderName.trim() === ''}
                primaryButtonColor="b"
                buttonText="Save"
                onClick={() => {
                  setOpenApplyToAllModal(true);
                }}
              />
              {selectedFolder.folderId !== defaultFolderId && (
                <PrimaryButton
                  isLoading={false}
                  disabled={folderName.trim() === ''}
                  primaryButtonColor="r"
                  buttonText="Delete folder"
                  onClick={() => {
                    setOpenDeleteModal(true);
                  }}
                />
              )}
            </View>
          </ScrollView>
        </View>
        <ConfirmationBottomSheet
          visible={openApplyToAllModal}
          onClose={() => setOpenApplyToAllModal(false)}
          title="Are you sure you want to apply these settings to chats already in this folder?"
          description="This will override whatever settings you have already set for chats in this folder. If you modify an individual chat’s settings later on,
            those settings will prevail for the chat."
          buttonColor="b"
          buttonText="Apply to all"
          onConfirm={async () => {
            await applyFolderPermissions(selectedFolder.folderId);
          }}
        />
        <ConfirmationBottomSheet
          visible={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          title="Are you sure you want to delete this folder?"
          description="When you delete the folder, all your contacts will move to the Primary folder and inherit default contact settings."
          buttonColor="r"
          buttonText="Delete folder"
          onConfirm={async () => {
            await deleteFolder(selectedFolder.folderId);
            navigation.navigate('HomeTab', {
              selectedFolder: {...defaultFolderInfo},
            });
          }}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingHorizontal: PortSpacing.secondary.uniform,
  },
  chatSettingsContainer: {
    marginBottom: PortSpacing.secondary.bottom,
  },
  buttonWrapper: {
    gap: PortSpacing.secondary.uniform,
    paddingVertical: PortSpacing.secondary.top,
  },
});

export default EditFolder;
