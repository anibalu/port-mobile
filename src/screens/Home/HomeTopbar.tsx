/**
 * Top Bar of the home screen containing sidebar menu, pending request count and search.
 */
import SearchIcon from '@assets/icons/searchThin.svg';
import PendingRequestIcon from '@assets/icons/PendingRequests.svg';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {TOPBAR_HEIGHT, defaultFolderId} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';
import SidebarMenu from '@assets/icons/SidebarMenu.svg';
import SettingsIcon from '@assets/icons/Settings.svg';
import React, {ReactNode, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import SearchBar from '../../components/Reusable/TopBars/SearchBar';
import {FolderInfo} from '@utils/ChatFolders/interfaces';

type TopbarProps = {
  unread: number;
  openSideDrawer?: boolean;
  setOpenSideDrawer?: any;
  searchText: string;
  setSearchText: (text: string) => void;
  folder: FolderInfo;
  pendingRequestsLength: number;
  showPrompt?: boolean;
};

function HomeTopbar({
  unread = 0,
  setOpenSideDrawer,
  searchText,
  setSearchText,
  folder,
  pendingRequestsLength,
  showPrompt = false,
}: TopbarProps): ReactNode {
  const title = unread ? `${folder.name} (${unread})` : `${folder.name}`;
  const navigation = useNavigation<any>();

  const [isSearchActive, setIsSearchActive] = useState(false);

  return (
    <View style={styles.bar}>
      {isSearchActive ? (
        <View style={{flex: 1}}>
          <SearchBar
            setIsSearchActive={setIsSearchActive}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        </View>
      ) : (
        <>
          <View style={styles.menuLeft}>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: PortSpacing.secondary.uniform,
              }}
              onPress={() => setOpenSideDrawer(p => !p)}>
              <View style={styles.iconWrapper2}>
                <SidebarMenu width={24} height={24} />

                {showPrompt && <View style={styles.blueDot} />}
              </View>
              <NumberlessText
                numberOfLines={1}
                ellipsizeMode="tail"
                fontType={FontType.md}
                fontSizeType={FontSizeType.l}>
                {title}
              </NumberlessText>
            </Pressable>
          </View>
          <View style={styles.optionsRight}>
            {(folder.folderId === defaultFolderId ||
              folder.folderId === 'all') && (
              <Pressable
                style={styles.iconWrapper3}
                onPress={() => navigation.navigate('PendingRequests')}>
                <PendingRequestIcon width={24} height={24} />
                <View style={styles.badgeWrapper}>
                  <NumberlessText
                    textColor={PortColors.primary.blue.app}
                    fontType={FontType.rg}
                    fontSizeType={FontSizeType.s}>
                    {pendingRequestsLength}
                  </NumberlessText>
                </View>
              </Pressable>
            )}
            <Pressable
              style={styles.iconWrapper}
              onPress={() => setIsSearchActive(p => !p)}>
              <SearchIcon width={24} height={24} />
            </Pressable>
            {folder.folderId !== 'all' && (
              <Pressable
                style={styles.iconWrapper2}
                onPress={() =>
                  navigation.navigate('EditFolder', {
                    selectedFolder: folder,
                  })
                }>
                <SettingsIcon width={24} height={24} />
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PortColors.primary.white,
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: TOPBAR_HEIGHT,
  },
  blueDot: {
    backgroundColor: PortColors.primary.blue.app,
    height: 7,
    width: 7,
    position: 'absolute',
    top: 8,
    right: -3,
    borderRadius: 100,
  },
  modal: {
    margin: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  menuLeft: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  optionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    gap: 6,
  },
  backgroundImage: {
    width: 50,
    height: 50,
    position: 'absolute',
    resizeMode: 'cover',
  },
  iconWrapper: {
    backgroundColor: 'transparent',
    height: 40,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapper2: {
    backgroundColor: 'transparent',
    height: 40,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper3: {
    paddingTop: 2,
    backgroundColor: 'transparent',
    height: 40,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeWrapper: {
    position: 'absolute',
    height: 14,
    overflow: 'hidden',
    backgroundColor: PortColors.primary.white,
    textAlign: 'center',
    textAlignVertical: 'center',
    alignItems: 'center',
    top: 19,
    left: 12,
  },
});

export default HomeTopbar;
