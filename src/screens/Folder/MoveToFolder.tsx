import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import MultiSelectMembers from '@components/Reusable/MultiSelectMembers/MultiSelectMembers';
import SimpleTopbar from '@components/Reusable/TopBars/SimpleTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import React, {useEffect, useMemo, useState} from 'react';
import {KeyboardAvoidingView, StyleSheet, View, ScrollView} from 'react-native';
import {TOPBAR_HEIGHT} from '@configs/constants';
import {moveConnectionsToNewFolderWithoutPermissionChange} from '@utils/ChatFolders';
import {getConnections} from '@utils/Storage/connections';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '@navigation/AppStackTypes';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import SearchBar from '@components/SearchBar';

type Props = NativeStackScreenProps<AppStackParamList, 'MoveToFolder'>;

const MoveToFolder = ({route, navigation}: Props) => {
  //for loader used in the screen
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {selectedFolder} = route.params;
  const [selectedMembers, setSelectedMembers] = useState<ConnectionInfo[]>([]);
  const [members, setMembers] = useState<ConnectionInfo[]>([]);
  const [viewableMembers, setViewableMembers] = useState<ConnectionInfo[]>([]);

  //search text
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    (async () => {
      const connections = await getConnections();
      setMembers(connections);
      setViewableMembers(connections);
    })();
  }, []);

  useMemo(() => {
    const filteredData = members.filter(item => {
      return item.name.toLowerCase().includes(searchText.toLowerCase());
    });
    setViewableMembers(filteredData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    {
      assetName: 'BackIcon',
      light: require('@assets/light/icons/navigation/BlackArrowLeftThin.svg')
        .default,
      dark: require('@assets/dark/icons/navigation/BlackArrowLeftThin.svg')
        .default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const BackIcon = results.BackIcon;

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={styles.screen}>
        <SimpleTopbar
          IconLeft={BackIcon}
          onIconLeftPress={() => navigation.goBack()}
          heading={
            selectedMembers.length > 0
              ? `Selected ${selectedMembers?.length}`
              : 'Select chats'
          }
        />
        <View style={styles.barWrapper}>
          <SearchBar
            style={styles.search}
            searchText={searchText}
            setSearchText={setSearchText}
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
            <MultiSelectMembers
              selectedMembers={selectedMembers}
              setSelectedMembers={setSelectedMembers}
              members={viewableMembers}
            />
          </ScrollView>
          <View style={styles.buttonWrapper}>
            <PrimaryButton
              isLoading={isLoading}
              disabled={selectedMembers.length === 0}
              primaryButtonColor="b"
              buttonText={'Add to ' + selectedFolder.name}
              onClick={async () => {
                setIsLoading(true);
                //logic goes here
                await moveConnectionsToNewFolderWithoutPermissionChange(
                  selectedMembers,
                  selectedFolder.folderId,
                );
                setIsLoading(false);
                navigation.navigate('HomeTab', {
                  selectedFolder: selectedFolder,
                });
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      alignSelf: 'center',
      justifyContent: 'flex-start',
      width: screen.width,
      backgroundColor: color.primary.background,
    },
    scrollViewContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
    barWrapper: {
      paddingHorizontal: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: color.primary.surface,
      height: TOPBAR_HEIGHT,
    },
    buttonWrapper: {
      paddingVertical: PortSpacing.secondary.top,
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
  });

export default MoveToFolder;
