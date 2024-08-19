import React, {useCallback, useMemo, useState} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  ActivityIndicator, // Use ActivityIndicator for better performance
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SuperportCard from './SuperportCard';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithRadio from '@components/Reusable/OptionButtons/OptionWithRadio';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import {getAllCreatedSuperports} from '@utils/Ports';
import {getAllFolders} from '@utils/Storage/folders';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import SuperportsInfo from './SuperportsInfo';
import SuperportsTopbar from './SuperportsTopbar';
import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {SafeAreaView} from '@components/SafeAreaView';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  TOPBAR_HEIGHT,
} from '@configs/constants';
import {SuperportData} from '@utils/Storage/DBCalls/ports/superPorts';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import BackTopbarWithButton from '@components/Reusable/TopBars/BackTopBarWithButton';
import SearchBar from '@components/SearchBar';
import LinkToFolderBottomSheet from '@screens/Home/LinkToFolderBottomSheet';
import {BottomNavStackParamList} from '@navigation/BottomNavStackTypes';
import {useSelector} from 'react-redux';
import {SvgXml} from 'react-native-svg';
import {folderIdToHex} from '@utils/Folders/folderIdToHex';

type Props = NativeStackScreenProps<BottomNavStackParamList, 'Superports'>;

const Superports = ({navigation}: Props) => {
  const profile = useSelector(state => state.profile.profile);
  const {name, avatar} = useMemo(() => {
    return {
      name: profile?.name || DEFAULT_NAME,
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);

  const [profilePicAttr] = useState(avatar);
  const [displayName] = useState<string>(name);
  const [showSortby, setShowSortby] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Last used');
  const sortOptions = ['Last used', 'Paused'];
  const [selectedFolder, setSelectedFolder] = useState<FolderInfo | null>(null);
  const [openLinkToFolder, setOpenLinkToFolder] = useState<boolean>(false);
  const [foldersArray, setFoldersArray] = useState<FolderInfo[]>([]);
  const [superportsData, setSuperportsData] = useState<SuperportData[]>([]);
  const [filteredSuperportsData, setFilteredSuperportsData] = useState<
    SuperportData[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Default to true

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const fetchedFolders = await getAllFolders();
          const fetchedSuperportsData = await getAllCreatedSuperports();

          const sortedData = fetchedSuperportsData.sort((a, b) => {
            if (!a.usedOnTimestamp && !b.usedOnTimestamp) {
              return 0;
            } else if (!a.usedOnTimestamp) {
              return 1;
            } else if (!b.usedOnTimestamp) {
              return -1;
            } else {
              return (
                new Date(a.usedOnTimestamp).getTime() -
                new Date(b.usedOnTimestamp).getTime()
              );
            }
          });

          setFoldersArray(fetchedFolders);
          setSuperportsData(sortedData);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false); // Ensure loading state is false after data is fetched
        }
      })();
    }, []),
  );

  useMemo(() => {
    const searchFilteredData = superportsData.filter(item => {
      if (item.label !== '') {
        return item.label.toLowerCase().includes(searchText.toLowerCase());
      } else {
        return item.portId.toLowerCase().includes(searchText.toLowerCase());
      }
    });
    const folderFilteredData = searchFilteredData.filter(item => {
      if (!selectedFolder) {
        return true;
      } else {
        return item.folderId === selectedFolder.folderId;
      }
    });
    const pausedFilteredData = folderFilteredData.filter(item => {
      if (selectedFilter === 'Paused') {
        return item.paused;
      } else {
        return true;
      }
    });
    setFilteredSuperportsData(pausedFilteredData);
  }, [selectedFolder, searchText, selectedFilter, superportsData]);

  const onRadioClick = async (item: string) => {
    setSelectedFilter(item);
    setShowSortby(false);
  };

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'PlusIcon',
      light: require('@assets/light/icons/Plus.svg').default,
      dark: require('@assets/dark/icons/Plus.svg').default,
    },
    {
      assetName: 'SortFilterIcon',
      light: require('@assets/light/icons/Filter.svg').default,
      dark: require('@assets/dark/icons/Filter.svg').default,
    },
    {
      assetName: 'FolderIcon',
      light: require('@assets/light/icons/Folder.svg').default,
      dark: require('@assets/dark/icons/Folder.svg').default,
    },
    {
      assetName: 'FilterFunnelIcon',
      light: require('@assets/light/icons/FilterFunnel.svg').default,
      dark: require('@assets/dark/icons/FilterFunnel.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const PlusIcon = results.PlusIcon;
  const FilterFunnelIcon = results.FilterFunnelIcon;

  const getSvgXml = (color: string) => {
    return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.50065 1.75H15.5007C16.4173 1.75 17.1673 2.5 17.1673 3.41667V5.25C17.1673 5.91667 16.7507 6.75 16.334 7.16667L12.7507 10.3333C12.2507 10.75 11.9173 11.5833 11.9173 12.25V15.8333C11.9173 16.3333 11.584 17 11.1673 17.25L10.0007 18C8.91732 18.6667 7.41732 17.9167 7.41732 16.5833V12.1667C7.41732 11.5833 7.08398 10.8333 6.75065 10.4167L3.58398 7.08333C3.16732 6.66667 2.83398 5.91667 2.83398 5.41667V3.5C2.83398 2.5 3.58398 1.75 4.50065 1.75Z" stroke=${color} stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.10833 1.75L5 8.33333" stroke=${color} stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
  };

  const folderColor =
    selectedFolder &&
    folderIdToHex(selectedFolder.folderId, Colors.boldAccentColors);

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        {isLoading ? (
          <>
            <SuperportsTopbar heading={'Superports'} />
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: screen.height - TOPBAR_HEIGHT * 2,
              }}>
              <ActivityIndicator size="large" color={Colors.primary.accent} />
            </View>
          </>
        ) : (
          <>
            {superportsData.length > 0 ? (
              <>
                <BackTopbarWithButton
                  onButtonPress={() =>
                    navigation.navigate('SuperportScreen', {
                      selectedFolder: selectedFolder
                        ? {...selectedFolder}
                        : undefined,
                    })
                  }
                  title={`Superports (${filteredSuperportsData.length})`}
                  bgColor="w"
                  buttonName={'Create'}
                  Icon={PlusIcon}
                />
                {superportsData.length > 0 && (
                  <View style={styles.barWrapper}>
                    <SearchBar
                      style={styles.search}
                      searchText={searchText}
                      setSearchText={setSearchText}
                    />
                  </View>
                )}

                <KeyboardAvoidingView
                  behavior={isIOS ? 'padding' : 'height'}
                  keyboardVerticalOffset={isIOS ? 50 : 0}
                  style={styles.scrollViewContainer}>
                  <View style={styles.portsHeader}>
                    {/* <Pressable
                      onPress={() => setShowSortby(true)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: PortSpacing.tertiary.right,
                        width: '100%',
                      }}>
                      <SortFilterIcon width={20} height={20} />
                      <NumberlessText
                        numberOfLines={1}
                        textColor={Colors.text.primary}
                        fontSizeType={FontSizeType.m}
                        fontType={FontType.rg}>
                        {`Sort by - ${selectedFilter}`}
                      </NumberlessText>
                    </Pressable> */}
                    <Pressable
                      onPress={() => setOpenLinkToFolder(true)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: PortSpacing.tertiary.right,
                        width: '100%',
                        justifyContent: 'space-between',
                      }}>
                      <NumberlessText
                        numberOfLines={1}
                        textColor={Colors.text.primary}
                        fontSizeType={FontSizeType.l}
                        fontType={FontType.sb}>
                        Show Superports from
                      </NumberlessText>
                      <View
                        style={{
                          backgroundColor: Colors.primary.surface,
                          paddingHorizontal: 8,
                          paddingVertical: 8,
                          borderRadius: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          borderColor: !selectedFolder
                            ? Colors.primary.stroke
                            : folderColor
                            ? folderColor
                            : Colors.text.primary,
                          borderWidth: 1,
                        }}>
                        {selectedFolder === null ? (
                          <FilterFunnelIcon width={20} height={20} />
                        ) : (
                          <SvgXml
                            xml={getSvgXml(
                              folderColor ? folderColor : Colors.text.primary,
                            )}
                          />
                        )}

                        <NumberlessText
                          numberOfLines={1}
                          textColor={
                            !selectedFolder
                              ? Colors.text.primary
                              : folderColor
                              ? folderColor
                              : Colors.text.primary
                          }
                          fontSizeType={FontSizeType.m}
                          fontType={FontType.rg}>
                          {selectedFolder && selectedFolder.folderId !== 'all'
                            ? selectedFolder.name
                            : 'Folder name'}
                        </NumberlessText>
                      </View>
                    </Pressable>
                  </View>
                  <FlatList
                    ListEmptyComponent={
                      <View style={styles.noSharedmediaWrapper}>
                        <NumberlessText
                          fontSizeType={FontSizeType.s}
                          fontType={FontType.rg}
                          textColor={Colors.text.subtitle}>
                          No Available Superports
                        </NumberlessText>
                      </View>
                    }
                    style={{paddingHorizontal: PortSpacing.secondary.uniform}}
                    horizontal={false}
                    showsVerticalScrollIndicator={false}
                    data={filteredSuperportsData}
                    keyExtractor={item => item.portId}
                    renderItem={({item}) => {
                      return (
                        <SuperportCard
                          selectedFolder={foldersArray.find(
                            folder => folder.folderId === item.folderId,
                          )}
                          superportData={item}
                          onClick={() =>
                            navigation.navigate('SuperportScreen', {
                              portId: item.portId,
                              selectedFolder: foldersArray.find(
                                folder => folder.folderId === item.folderId,
                              ),
                            })
                          }
                        />
                      );
                    }}
                  />
                </KeyboardAvoidingView>
                <PrimaryBottomSheet
                  bgColor="g"
                  title="Sort by"
                  showClose
                  onClose={() => setShowSortby(false)}
                  visible={showSortby}>
                  <SimpleCard
                    style={{
                      width: '100%',
                      marginTop: PortSpacing.secondary.top,
                    }}>
                    {sortOptions.map((item, index) => {
                      return (
                        <View key={item}>
                          <OptionWithRadio
                            selectedOptionComparision={item}
                            onClick={() => onRadioClick(item)}
                            selectedOption={selectedFilter}
                            title={item}
                          />
                          {index !== sortOptions.length - 1 && (
                            <LineSeparator />
                          )}
                        </View>
                      );
                    })}
                  </SimpleCard>
                </PrimaryBottomSheet>
              </>
            ) : (
              <SuperportsInfo name={displayName} avatar={profilePicAttr} />
            )}
          </>
        )}
        <LinkToFolderBottomSheet
          title={'Filter by folder'}
          currentFolder={
            selectedFolder
              ? selectedFolder
              : {name: 'All Chats', folderId: 'all', permissionsId: 'all'}
          }
          foldersArray={[
            {name: 'All Chats', folderId: 'all', permissionsId: 'all'},
            ...foldersArray,
          ]}
          onClose={() => setOpenLinkToFolder(false)}
          setSelectedFolderData={setSelectedFolder}
          visible={openLinkToFolder}
        />
      </SafeAreaView>
    </>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    portsHeader: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: PortSpacing.secondary.bottom,
      gap: PortSpacing.medium.uniform,
      flexWrap: 'wrap',
    },
    noSharedmediaWrapper: {
      alignSelf: 'center',
      marginTop: PortSpacing.primary.top,
    },
    noSharedMediaText: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.tertiary.uniform,
      textAlign: 'center',
    },
    barWrapper: {
      paddingHorizontal: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: color.primary.surface,
      paddingBottom: PortSpacing.tertiary.uniform,
      paddingVertical: PortSpacing.tertiary.bottom,
    },
    search: {
      backgroundColor: color.primary.surface2,
      width: '100%',
      flexDirection: 'row',
      height: 44,
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: PortSpacing.tertiary.uniform,
    },
    scrollViewContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: color.primary.background,
    },
    buttonWrapper: {
      padding: PortSpacing.secondary.uniform,
    },
  });

export default Superports;
