import {PortSpacing} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {SafeAreaView} from '@components/SafeAreaView';
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
import {defaultFolderId, defaultPermissions} from '@configs/constants';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {applyFolderPermissions, deleteFolder} from '@utils/ChatFolders';
import {updateFolderName} from '@utils/Storage/folders';
import {getFolderPermissions} from '@utils/Storage/permissions';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '@navigation/AppStackTypes';
import EditName from '@components/Reusable/BottomSheets/EditName';
import EditableInputCard from '@components/Reusable/Cards/EditableInputCard';
import ConfirmationBottomSheet from '@components/Reusable/BottomSheets/ConfirmationBottomSheet';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

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
    await updateFolderName(selectedFolder.folderId, folderName);
    setIsEditFolderNameModalOpen(false);
  };

  useMemo(() => {
    onSaveFolderName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderName]);

  const [openApplyToAllModal, setOpenApplyToAllModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    // 1.Clock
    {
      assetName: 'CrossButton',
      light: require('@assets/light/icons/Cross.svg').default,
      dark: require('@assets/dark/icons/Cross.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const CrossButton = results.CrossButton;
  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
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
              backgroundColor: Colors.primary.surface,
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
                  color: Colors.text.primary,
                  marginBottom: PortSpacing.tertiary.bottom,
                }}
                fontSizeType={FontSizeType.l}
                fontType={FontType.md}>
                Customize chats in this folder
              </NumberlessText>
              <NumberlessText
                style={{color: Colors.text.subtitle}}
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                Changes to these settings will apply to all new chats added to
                this folder. If you change settings for a specific chat later,
                those changes will take precedence for that chat.
              </NumberlessText>
            </View>
            <View style={styles.chatSettingsContainer}>
              <ChatSettingsCard
                showDissapearingMessagesOption={false}
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
                buttonText="Apply to existing"
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
          title="Do you want to apply these settings to existing chats in this folder?"
          description="This will override whatever settings you have already set for chats in this folder. If you modify an individual chat’s settings later on,
            those settings will prevail for the chat."
          buttonColor="b"
          buttonText="Apply to existing"
          onConfirm={async () => {
            await applyFolderPermissions(selectedFolder.folderId);
          }}
        />
        <ConfirmationBottomSheet
          visible={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
          title="Are you sure you want to delete this folder?"
          description="When you delete the folder, all your contacts will move to the Primary folder and inherit its contact settings."
          buttonColor="r"
          buttonText="Delete folder"
          onConfirm={async () => {
            await deleteFolder(selectedFolder.folderId);
            navigation.goBack();
          }}
        />
      </SafeAreaView>
    </>
  );
};

const styling = colors =>
  StyleSheet.create({
    scrollViewContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingHorizontal: PortSpacing.secondary.uniform,
      backgroundColor: colors.primary.background,
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
