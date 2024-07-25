import {PortSpacing, isIOS} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {SafeAreaView} from '@components/SafeAreaView';
import React, {useMemo, useState} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import SecondaryButton from '@components/Reusable/LongButtons/SecondaryButton';
import FilledPill from '@components/Reusable/Pill/FilledPill';
import {SuperportData} from '@utils/Ports/interfaces';
import {
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  TOPBAR_HEIGHT,
} from '@configs/constants';
import {FolderInfo} from '@utils/ChatFolders/interfaces';
import SuperportCard from './SuperportCard';
import SimpleTopbar from '@components/Reusable/TopBars/SimpleTopBar';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import OptionWithRadio from '@components/Reusable/OptionButtons/OptionWithRadio';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import SearchBar from '@components/Reusable/TopBars/SearchBar';
import {getAllCreatedSuperports} from '@utils/Ports';
import {getAllFolders} from '@utils/ChatFolders';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {FileAttributes} from '@utils/Storage/interfaces';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

type Props = NativeStackScreenProps<AppStackParamList, 'Superports'>;

const Superports = ({route, navigation}: Props) => {
  const {name, avatar} = route.params;
  const processedName: string = name || DEFAULT_NAME;
  const processedAvatar: FileAttributes = avatar || DEFAULT_PROFILE_AVATAR_INFO;
  const [profilePicAttr] = useState(processedAvatar);
  const [displayName] = useState<string>(processedName);
  //show sort by options
  const [showSortby, setShowSortby] = useState(false);
  //is search bar active
  const [isSearchActive, setIsSearchActive] = useState(false);
  //search text
  const [searchText, setSearchText] = useState('');
  //selected filter
  const [selectedFilter, setSelectedFilter] = useState('Last used');
  //sort superports by various options
  const sortOptions = ['Last used', 'Paused'];
  //selected folder to sort by. null means all chats
  const [selectedFolder, setSelectedFolder] = useState<FolderInfo | null>(null);
  //all available folders
  const [foldersArray, setFoldersArray] = useState<FolderInfo[]>([]);
  //all available superports
  const [superportsData, setSuperportsData] = useState<SuperportData[]>([]);
  //superports to display
  const [filteredSuperportsData, setFilteredSuperportsData] = useState<
    SuperportData[]
  >([]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setFoldersArray(await getAllFolders());
        const fetchedSuperportsData = await getAllCreatedSuperports();
        const sortedData = fetchedSuperportsData.sort((a, b) => {
          // If both timestamps are null, maintain their relative order
          if (a.usedOnTimestamp === null && b.usedOnTimestamp === null) {
            return 0;
          }
          // If a's timestamp is null, move it to the end
          else if (a.usedOnTimestamp === null) {
            return 1;
          }
          // If b's timestamp is null, move it to the end
          else if (b.usedOnTimestamp === null) {
            return -1;
          } else {
            // Sort by timestamps for non-null timestamps
            return (
              new Date(a.usedOnTimestamp).getTime() -
              new Date(b.usedOnTimestamp).getTime()
            );
          }
        });
        setSuperportsData(sortedData);
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
      assetName: 'SearchIcon',
      light: require('@assets/light/icons/search.svg').default,
      dark: require('@assets/dark/icons/search.svg').default,
    },
    {
      assetName: 'BackIcon',
      light: require('@assets/light/icons/navigation/BlackArrowLeftThin.svg')
        .default,
      dark: require('@assets/dark/icons/navigation/BlackArrowLeftThin.svg')
        .default,
    },
    {
      assetName: 'FilterIcon',
      light: require('@assets/light/icons/Filter.svg').default,
      dark: require('@assets/dark/icons/Filter.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const SearchIcon = results.SearchIcon;
  const BackIcon = results.BackIcon;
  const FilterIcon = results.FilterIcon;
  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        {isSearchActive ? (
          <View style={styles.barWrapper}>
            <SearchBar
              setIsSearchActive={setIsSearchActive}
              searchText={searchText}
              setSearchText={setSearchText}
            />
          </View>
        ) : (
          <SimpleTopbar
            IconRight={SearchIcon}
            onIconRightPress={() => setIsSearchActive(p => !p)}
            IconLeft={BackIcon}
            onIconLeftPress={() => navigation.goBack()}
            heading={`Superports (${filteredSuperportsData.length})`}
          />
        )}
        <View
          style={{
            backgroundColor: Colors.primary.surface,
            paddingHorizontal: PortSpacing.secondary.uniform,
            paddingBottom: PortSpacing.secondary.bottom,
            paddingTop: PortSpacing.tertiary.top,
          }}>
          <NumberlessText
            style={{
              marginBottom: PortSpacing.secondary.bottom,
            }}
            textColor={Colors.text.primary}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            Filter by chat folder
          </NumberlessText>
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            data={[
              {name: 'All', folderId: 'all', permissionsId: 'all'},
              ...foldersArray,
            ]}
            keyExtractor={item => item.folderId}
            renderItem={({item}) => (
              <FilledPill
                value={item.folderId === 'all' ? null : item}
                selectedPill={selectedFolder}
                onClick={() => {
                  item.folderId === 'all'
                    ? setSelectedFolder(null)
                    : setSelectedFolder(item);
                }}
              />
            )}
          />
        </View>
        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : 'height'}
          keyboardVerticalOffset={isIOS ? 50 : 0}
          style={styles.scrollViewContainer}>
          <View style={styles.portsHeader}>
            <NumberlessText
              style={{
                color: Colors.text.primary,
              }}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              {`${selectedFolder ? selectedFolder.name : 'All'} Superports (${
                filteredSuperportsData.length
              })`}
            </NumberlessText>
            <Pressable
              onPress={() => setShowSortby(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <NumberlessText
                style={styles.sortbyText}
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                Sort by
              </NumberlessText>
              <FilterIcon width={20} height={20} />
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
                      name: displayName,
                      avatar: profilePicAttr,
                      selectedFolder: foldersArray.find(
                        folder => folder.folderId === item.folderId,
                      ),
                    })
                  }
                />
              );
            }}
          />
          <View style={styles.buttonWrapper}>
            <SecondaryButton
              secondaryButtonColor="b"
              buttonText="New Superport"
              onClick={() =>
                navigation.navigate('SuperportScreen', {
                  name: displayName,
                  avatar: profilePicAttr,
                  selectedFolder: selectedFolder
                    ? {...selectedFolder}
                    : undefined,
                })
              }
            />
          </View>
        </KeyboardAvoidingView>
        <PrimaryBottomSheet
          bgColor="g"
          title="Sort by"
          showClose={true}
          onClose={() => setShowSortby(false)}
          visible={showSortby}>
          <SimpleCard
            style={{width: '100%', marginTop: PortSpacing.secondary.top}}>
            {sortOptions.map((item, index) => {
              return (
                <View key={item}>
                  <OptionWithRadio
                    selectedOptionComparision={item}
                    onClick={() => onRadioClick(item)}
                    selectedOption={selectedFilter}
                    title={item}
                  />
                  {index !== sortOptions.length - 1 && <LineSeparator />}
                </View>
              );
            })}
          </SimpleCard>
        </PrimaryBottomSheet>
      </SafeAreaView>
    </>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    portsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: PortSpacing.secondary.bottom,
      flexWrap: 'wrap',
    },
    noSharedmediaWrapper: {
      alignSelf: 'center',
      marginTop: PortSpacing.secondary.top,
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
      height: TOPBAR_HEIGHT,
    },
    sortbyText: {
      color: color.text.primary,
      marginRight: PortSpacing.tertiary.right,
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
      backgroundColor: color.primary.surface,
    },
  });

export default Superports;
