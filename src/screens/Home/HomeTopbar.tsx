/**
 * Top Bar of the home screen containing sidebar menu, pending request count and search.
 */
import SearchIcon from '@assets/icons/searchThin.svg';
import PendingRequestIcon from '@assets/icons/PendingRequestNew.svg';
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {TOPBAR_HEIGHT, defaultFolderId} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';
import SidebarMenu from '@assets/icons/SidebarMenu.svg';
import SettingsIcon from '@assets/icons/FolderSettings.svg';
import React, {ReactNode, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import SearchBar from '../../components/Reusable/TopBars/SearchBar';
import {FolderInfo} from '@utils/ChatFolders/interfaces';
import {GenericButton} from '@components/GenericButton';
import Cross from '@assets/icons/cross.svg';
import {ChatTileProps} from '@components/ChatTile/ChatTile';

type TopbarProps = {
  openSwipeable: any;
  unread: number;
  searchText: string;
  setSearchText: (text: string) => void;
  folder: FolderInfo;
  showPrompt?: boolean;
  selectionMode: boolean;
  setSelectionMode: (x: boolean) => void;
  selectedConnections: ChatTileProps[];
  setSelectedConnections: (x: ChatTileProps[]) => void;
};

function HomeTopbar({
  openSwipeable,
  unread = 0,
  searchText,
  setSearchText,
  folder,
  showPrompt = false,
  selectionMode,
  setSelectionMode,
  selectedConnections,
  setSelectedConnections,
}: TopbarProps): ReactNode {
  const title = unread ? `${folder.name} (${unread})` : `${folder.name}`;
  const navigation = useNavigation<any>();

  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleCancel = () => {
    setSelectedConnections([]);
    setSelectionMode(false);
  };
  return (
    <>
      {selectionMode ? (
        <View style={styles.selectedBar}>
          <View style={styles.profileBar}>
            <View style={styles.titleBar}>
              <NumberlessText
                fontSizeType={FontSizeType.l}
                fontType={FontType.md}
                ellipsizeMode="tail"
                style={styles.selectedCount}
                numberOfLines={1}>
                {'Selected (' + selectedConnections.length.toString() + ')'}
              </NumberlessText>
            </View>
            <View>
              <GenericButton
                buttonStyle={styles.crossBox}
                IconLeft={Cross}
                onPress={handleCancel}
              />
            </View>
          </View>
        </View>
      ) : (
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
                  onPress={openSwipeable}>
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
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PortColors.primary.white,
    height: TOPBAR_HEIGHT,
  },
  selectedBar: {
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PortColors.primary.white,
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
  profileBar: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBar: {
    flex: 1,
    marginLeft: 10,
    maxWidth: '60%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: PortSpacing.tertiary.uniform,
  },
  selectedCount: {
    color: PortColors.primary.black,
    overflow: 'hidden',
    width: screen.width / 2,
  },
  crossBox: {
    backgroundColor: PortColors.primary.white,
    alignItems: 'flex-end',
    height: 40,
    top: 7,
    width: 40,
  },
});

export default HomeTopbar;
