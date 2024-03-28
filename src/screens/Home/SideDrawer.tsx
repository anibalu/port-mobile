import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import BlackAngleRight from '@assets/icons/BlackAngleRight.svg';
import AddFolder from '@assets/icons/AddFolder.svg';
import {useNavigation} from '@react-navigation/native';
import NewSuperportIcon from '@assets/icons/NewSuperportBlack.svg';
import DefaultFolder from '@assets/icons/DefaultFolder.svg';
import PendingRequestIcon from '@assets/icons/pendingRequestThin.svg';
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

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={
          isIOS ? PortColors.primary.grey.light : PortColors.primary.white
        }
      />
      <SafeAreaView>
        <View style={styles.drawerContainer}>
          <View style={styles.myprofileWrapper}>
            <AvatarBox profileUri={profilePicAttr.fileUri} avatarSize={'s'} />
            <Pressable
              style={styles.mrpyofileButton}
              onPress={navigateToMyprofile}>
              <NumberlessText
                style={{marginLeft: PortSpacing.tertiary.left}}
                textColor={PortColors.primary.black}
                fontType={FontType.rg}
                fontSizeType={FontSizeType.l}>
                {name}
              </NumberlessText>
              <BlackAngleRight width={20} height={20} />
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
              showPending={true}
              pendingCount={pendingRequestsLength}
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
                  IconLeft={DefaultFolder}
                  isBadgeFilled={true}
                  onClick={() =>
                    handleFolderOptionClick(element.item as FolderInfo)
                  }
                />
                {element.index == 1 && folders.length > 2 && (
                  <NumberlessText
                    style={{
                      marginLeft: PortSpacing.secondary.left,
                      marginVertical: PortSpacing.tertiary.uniform,
                    }}
                    textColor={PortColors.subtitle}
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

const styles = StyleSheet.create({
  drawerContainer: {
    width: '100%',
    flex: 1,
  },
  buttonWrapper: {
    borderTopWidth: 1,
    borderTopColor: PortColors.primary.border.dullGrey,
    padding: PortSpacing.secondary.uniform,
  },
  newOptionsWrapper: {
    paddingVertical: 12,
    borderBottomColor: PortColors.primary.border.dullGrey,
    borderBottomWidth: 1,
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
    backgroundColor: PortColors.primary.grey.light,
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
