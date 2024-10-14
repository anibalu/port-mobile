import {PortSpacing, isIOS} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {SafeAreaView} from '@components/SafeAreaView';
import React, {useState} from 'react';
import {StyleSheet, View, ScrollView, KeyboardAvoidingView} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import AdvanceSettingsCard from '@components/Reusable/PermissionCards/AdvanceSettingsCard';
import ChatSettingsCard from '@components/Reusable/PermissionCards/ChatSettingsCard';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {defaultPermissions} from '@configs/constants';
import {PermissionsStrict} from '@utils/Storage/DBCalls/permissions/interfaces';
import {
  addNewFolder,
  moveConnectionToNewFolderWithoutPermissionChange,
} from '@utils/ChatFolders';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {updateGeneratedSuperportFolder} from '@utils/Ports';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {useTheme} from 'src/context/ThemeContext';
import store from '@store/appStore';
import InputWithoutBorder from '@components/Reusable/Inputs/InputWithoutBorder';
import FavouriteFolderBottomsheet from '@components/Reusable/BottomSheets/FavouriteFolderBottomsheet';
import DisabledPermissionBottomSheet from '@components/Reusable/BottomSheets/DisabledPermissionBottomSheet';
import FavouriteFolderSettingsCard from '@components/Reusable/PermissionCards/FavouriteFolderSettingsCard';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateFolder'>;

const CreateFolder = ({navigation, route}: Props) => {
  const {
    onSaveDetails,
    setSelectedFolder = () => {},
    portId,
    chatId,
    superportLabel,
    saveDetails,
    savedFolderPermissions,
  } = route.params;
  //sets folder name
  const [folderName, setFolderName] = useState<string>(superportLabel || '');
  //set permissions
  const [permissions, setPermissions] = useState<PermissionsStrict>(
    savedFolderPermissions
      ? {...savedFolderPermissions}
      : {...defaultPermissions},
  );
  //for loader used in the screen
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openFolderBottomsheet, setOpenFolderBottomsheet] = useState(false);

  const Colors = DynamicColors();
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
  const styles = styling(Colors);
  const {themeValue} = useTheme();
  const [
    openDisabledPermissionBottomsheet,
    setOpenDisabledPermissionBottomsheet,
  ] = useState(false);

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <TopBarWithRightIcon
          onIconRightPress={() => navigation.goBack()}
          IconRight={CrossButton}
          heading={saveDetails ? ' Edit Folder Settings' : 'Create new folder'}
        />
        <View
          style={{
            paddingHorizontal: PortSpacing.secondary.uniform,
            paddingVertical: PortSpacing.tertiary.uniform,
            backgroundColor: Colors.primary.surface,
          }}>
          <InputWithoutBorder
            isEditable={true}
            placeholderText="Folder name"
            bgColor={themeValue === 'dark' ? 'w' : 'g'}
            text={folderName}
            setText={setFolderName}
          />
        </View>

        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : 'height'}
          keyboardVerticalOffset={isIOS ? 50 : 0}
          style={styles.scrollViewContainer}>
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
                fontType={FontType.rg}>
                Customize chats in this folder
              </NumberlessText>
              <NumberlessText
                style={{color: Colors.text.subtitle}}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                Changes to these settings will apply to all new chats added to
                this folder. If you change settings for a specific chat later,
                those changes will take precedence for that chat.
              </NumberlessText>
            </View>
            <View style={styles.chatSettingsContainer}>
              <AdvanceSettingsCard
                permissions={permissions}
                setPermissions={setPermissions}
                heading={'Allow contacts in this folder to'}
              />
              <ChatSettingsCard
                showDissapearingMessagesOption={false}
                permissions={permissions}
                setPermissions={setPermissions}
                setOpenDisabledPermissionBottomsheet={
                  setOpenDisabledPermissionBottomsheet
                }
              />
              <FavouriteFolderSettingsCard
                permissions={permissions}
                heading="Favourite folder"
                setOpenFolderBottomsheet={setOpenFolderBottomsheet}
                setPermissions={setPermissions}
              />
            </View>
          </ScrollView>
          <View style={styles.buttonWrapper}>
            {!saveDetails ? (
              <PrimaryButton
                isLoading={isLoading}
                disabled={folderName.trim() === ''}
                primaryButtonColor="b"
                buttonText="Create folder"
                onClick={async () => {
                  setIsLoading(true);
                  const folder = await addNewFolder(folderName, permissions);
                  if (portId) {
                    await updateGeneratedSuperportFolder(
                      portId,
                      folder.folderId,
                    );
                  } else if (chatId) {
                    await moveConnectionToNewFolderWithoutPermissionChange(
                      chatId,
                      folder.folderId,
                    );
                    setSelectedFolder(folder);
                  } else {
                    setSelectedFolder(folder);
                  }
                  setIsLoading(false);
                  if (portId) {
                    navigation.navigate('SuperportScreen', {portId: portId});
                  } else {
                    navigation.goBack();
                  }
                  store.dispatch({
                    type: 'PING',
                    payload: 'PONG',
                  });
                }}
              />
            ) : (
              <PrimaryButton
                isLoading={isLoading}
                disabled={folderName.trim() === ''}
                primaryButtonColor="b"
                buttonText="Save"
                onClick={() => {
                  onSaveDetails && onSaveDetails(permissions, folderName);
                }}
              />
            )}
            <FavouriteFolderBottomsheet
              visible={openFolderBottomsheet}
              onClose={() => setOpenFolderBottomsheet(p => !p)}
            />
            <DisabledPermissionBottomSheet
              visible={openDisabledPermissionBottomsheet}
              onClose={() => setOpenDisabledPermissionBottomsheet(p => !p)}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
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
      paddingVertical: PortSpacing.secondary.uniform,
    },
  });

export default CreateFolder;
