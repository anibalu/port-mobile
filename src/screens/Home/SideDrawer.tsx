import {PortSpacing} from '@components/ComponentUtils';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import AddFolder from '@assets/icons/AddFolder.svg';

import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import SideDrawerOption from './SideDrawerOption';
import FolderDrawerOption from './FolderDrawerOption';
import {FlatList} from 'react-native';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {FolderInfo, FolderInfoWithUnread} from '@utils/ChatFolders/interfaces';
import {FileAttributes} from '@utils/Storage/interfaces';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {defaultFolderId} from '@configs/constants';
import DynamicColors from '@components/DynamicColors';
import {useTheme} from 'src/context/ThemeContext';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {useNavigation} from '@react-navigation/native';

function SideDrawer({
  closeSwipeable,
  selectedFolderData,
  setSelectedFolderData,
  folders,
  name,
  profilePicAttr,
  pendingRequestsLength,
  superportsLength,
}: {
  closeSwipeable: () => void;
  selectedFolderData: FolderInfo;
  setSelectedFolderData: (folder: FolderInfo) => void;
  folders: FolderInfoWithUnread[];
  name: string;
  profilePicAttr: FileAttributes;
  pendingRequestsLength: number;
  superportsLength: number;
}) {
  const navigation = useNavigation();

  const handleFolderOptionClick = (folder: FolderInfo) => {
    setSelectedFolderData(folder);
    closeSwipeable();
  };

  const navigateToMyprofile = () => {
    closeSwipeable();
    navigation.navigate('MyProfile', {
      name: name,
      avatar: profilePicAttr,
    });
  };

  const navigateToPendingReq = () => {
    closeSwipeable();
    navigation.navigate('PendingRequests');
  };

  const handleNewSuperportsClick = () => {
    closeSwipeable();
    navigation.navigate('Superports', {name: name, avatar: profilePicAttr});
  };

  const Colors = DynamicColors();
  const {themeValue} = useTheme();
  const styles = styling(Colors, themeValue);
  const svgArray = [
    {
      assetName: 'AllChatsFolderIcon',
      light: require('@assets/light/icons/AllChatsFolder.svg').default,
      dark: require('@assets/dark/icons/AllChatsFolder.svg').default,
    },
    {
      assetName: 'PrimaryFolderIcon',
      light: require('@assets/light/icons/PrimaryFolder.svg').default,
      dark: require('@assets/dark/icons/PrimaryFolder.svg').default,
    },
    {
      assetName: 'DefaultFolderIcon',
      light: require('@assets/light/icons/DefaultFolder.svg').default,
      dark: require('@assets/dark/icons/DefaultFolder.svg').default,
    },
    {
      assetName: 'PendingRequestIcon',
      light: require('@assets/light/icons/PendingRequest.svg').default,
      dark: require('@assets/dark/icons/PendingRequest.svg').default,
    },
    {
      assetName: 'NewSuperportIcon',
      light: require('@assets/light/icons/NewSuperport.svg').default,
      dark: require('@assets/dark/icons/NewSuperport.svg').default,
    },
    {
      assetName: 'AngleRightIcon',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const AllChatsFolderIcon = results.AllChatsFolderIcon;
  const PrimaryFolderIcon = results.PrimaryFolderIcon;
  const DefaultFolderIcon = results.DefaultFolderIcon;
  const PendingRequestIcon = results.PendingRequestIcon;
  const NewSuperportIcon = results.NewSuperportIcon;
  const AngleRightIcon = results.AngleRightIcon;

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={Colors.primary.surface}
      />
      <SafeAreaView style={{backgroundColor: Colors.primary.surface}}>
        <View style={styles.drawerContainer}>
          <View style={styles.myprofileWrapper}>
            <AvatarBox profileUri={profilePicAttr.fileUri} avatarSize={'s'} />
            <Pressable
              style={styles.mrpyofileButton}
              onPress={navigateToMyprofile}>
              <View>
                <NumberlessText
                  style={{marginLeft: PortSpacing.tertiary.left}}
                  textColor={Colors.text.primary}
                  fontType={FontType.rg}
                  fontSizeType={FontSizeType.l}>
                  {name}
                </NumberlessText>
                <NumberlessText
                  style={{marginLeft: PortSpacing.tertiary.left}}
                  textColor={Colors.text.subtitle}
                  fontType={FontType.rg}
                  fontSizeType={FontSizeType.s}>
                  Profile, Backups
                </NumberlessText>
              </View>
              <AngleRightIcon width={20} height={20} />
            </Pressable>
          </View>
          <View style={styles.newOptionsWrapper}>
            <SideDrawerOption
              title={'Superports'}
              IconLeft={NewSuperportIcon}
              onClick={handleNewSuperportsClick}
              badge={superportsLength}
            />
            <SideDrawerOption
              title={'Pending Ports'}
              IconLeft={PendingRequestIcon}
              onClick={navigateToPendingReq}
              badge={pendingRequestsLength}
            />
          </View>
          <FlatList
            scrollEnabled={folders.length > 0}
            data={folders}
            contentContainerStyle={{flex: 1}}
            renderItem={element => (
              <View>
                <FolderDrawerOption
                  isSelected={
                    selectedFolderData.folderId === element.item.folderId
                  }
                  badge={element.item.unread}
                  title={element.item.name}
                  IconLeft={(() => {
                    switch (element.item.folderId) {
                      case defaultFolderId:
                        return PrimaryFolderIcon;
                      case 'all':
                        return AllChatsFolderIcon;
                      default:
                        return DefaultFolderIcon;
                    }
                  })()}
                  isBadgeFilled={true}
                  onClick={() =>
                    handleFolderOptionClick(element.item as FolderInfo)
                  }
                />
                {element.index === 1 && folders.length > 2 && (
                  <NumberlessText
                    style={{
                      marginLeft: PortSpacing.secondary.left,
                      marginVertical: PortSpacing.tertiary.uniform,
                    }}
                    textColor={Colors.text.primary}
                    fontType={FontType.rg}
                    fontSizeType={FontSizeType.m}>
                    Your folders
                  </NumberlessText>
                )}
              </View>
            )}
            style={{paddingVertical: 12}}
            keyExtractor={item => item.folderId}
          />
          <View style={styles.buttonWrapper}>
            <PrimaryButton
              buttonText="Create a chat folder"
              Icon={AddFolder}
              primaryButtonColor="b"
              onClick={() =>
                navigation.navigate('CreateFolder', {
                  setSelectedFolder: setSelectedFolderData,
                })
              }
              iconSize="s"
              disabled={false}
              isLoading={false}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styling = (colors: any, themeValue: any) =>
  StyleSheet.create({
    drawerContainer: {
      width: '100%',
      flex: 1,
      backgroundColor: colors.primary.surface,
    },
    buttonWrapper: {
      borderTopWidth: 0.5,
      borderTopColor: colors.primary.stroke,
      padding: PortSpacing.secondary.uniform,
    },
    newOptionsWrapper: {
      paddingVertical: 12,
      borderBottomColor: colors.primary.stroke,
      borderBottomWidth: 0.5,
    },
    mrpyofileButton: {
      borderRadius: 0,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
    },
    myprofileWrapper: {
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor:
        themeValue === 'light'
          ? colors.primary.background
          : colors.primary.surface2,
    },
    listItemWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    listItemButton: {
      borderRadius: 0,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
    },
  });

export default SideDrawer;
