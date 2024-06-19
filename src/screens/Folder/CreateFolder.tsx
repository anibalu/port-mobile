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
import SimpleInput from '@components/Reusable/Inputs/SimpleInput';
import {PermissionsStrict} from '@utils/ChatPermissions/interfaces';
import {addNewFolder} from '@utils/ChatFolders';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {updateGeneratedSuperportFolder} from '@utils/Ports';
import {moveConnectionToNewFolder} from '@utils/Connections';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateFolder'>;

const CreateFolder = ({navigation, route}: Props) => {
  const {setSelectedFolder, portId, chatId} = route.params;
  //sets folder name
  const [folderName, setFolderName] = useState<string>('');
  //set permissions
  const [permissions, setPermissions] = useState<PermissionsStrict>({
    ...defaultPermissions,
  });
  //for loader used in the screen
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <TopBarWithRightIcon
          onIconRightPress={() => navigation.goBack()}
          IconRight={CrossButton}
          heading={'Create new folder'}
        />
        <View
          style={{
            paddingHorizontal: PortSpacing.secondary.uniform,
            paddingBottom: PortSpacing.secondary.bottom,
            paddingTop: PortSpacing.tertiary.top,
            backgroundColor: Colors.primary.surface,
          }}>
          <SimpleInput
            placeholderText="Folder name"
            bgColor="w"
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
                permissions={permissions}
                setPermissions={setPermissions}
              />
            </View>
            <View>
              <AdvanceSettingsCard
                permissions={permissions}
                setPermissions={setPermissions}
              />
            </View>
          </ScrollView>
          <View style={styles.buttonWrapper}>
            <PrimaryButton
              isLoading={isLoading}
              disabled={folderName.trim() === ''}
              primaryButtonColor="b"
              buttonText="Create folder"
              onClick={async () => {
                setIsLoading(true);
                const folder = await addNewFolder(folderName, permissions);
                if (portId) {
                  await updateGeneratedSuperportFolder(portId, folder.folderId);
                } else if (chatId) {
                  await moveConnectionToNewFolder(chatId, folder.folderId);
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

                // navigation.navigate('HomeTab', {selectedFolder: folder});
              }}
            />
          </View>
        </KeyboardAvoidingView>
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
    paddingVertical: PortSpacing.secondary.uniform,
  },
});

export default CreateFolder;
