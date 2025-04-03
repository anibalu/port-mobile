import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import MultiSelectMembers from '@components/Reusable/MultiSelectMembers/MultiSelectMembers';
import SimpleTopbar from '@components/Reusable/TopBars/SimpleTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import React, {useEffect, useMemo, useState} from 'react';
import {KeyboardAvoidingView, StyleSheet, View} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {getDirectChats} from '@utils/DirectChats';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {
  requestContactBundleToShare,
  shareContactPort,
} from '@utils/ContactSharing';
import SearchBar from '@components/SearchBar';

type Props = NativeStackScreenProps<AppStackParamList, 'ShareContact'>;

const ShareContact = ({route, navigation}: Props) => {
  const {chatId} = route.params;
  //for loader used in the screen
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMembers, setSelectedMembers] = useState<ConnectionInfo[]>([]);
  const [allMembers, setAllMembers] = useState<ConnectionInfo[]>([]);
  const [viewableMembers, setViewableMembers] = useState<ConnectionInfo[]>([]);

  //search text
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    (async () => {
      const connections = (await getDirectChats()).filter(
        connection => connection.chatId !== chatId,
      );
      setAllMembers(connections);
      setViewableMembers(connections);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMemo(() => {
    const filteredData = allMembers.filter(item => {
      return item.name.toLowerCase().includes(searchText.toLowerCase());
    });
    setViewableMembers(filteredData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const onShare = async () => {
    setLoading(true);
    for (const mbr of selectedMembers) {
      try {
        await shareContactPort(mbr.chatId, chatId);
        console.info('Could use contact port, not falling back to legacy');
      } catch (e) {
        console.error('Could not share contact Port: ', e);
        console.info('Falling back to legacy contact sharing');
        requestContactBundleToShare({
          approved: false,
          destinationChatId: chatId,
          source: mbr.chatId,
        });
      }
    }
    setLoading(false);
    navigation.goBack();
  };

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
          <View style={{flex: 1}}>
            <MultiSelectMembers
              selectedMembers={selectedMembers}
              setSelectedMembers={setSelectedMembers}
              members={viewableMembers}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <PrimaryButton
              isLoading={loading}
              disabled={selectedMembers.length === 0}
              primaryButtonColor="b"
              buttonText={'Share contacts'}
              onClick={async () => {
                await onShare();
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
    },
    barWrapper: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: color.primary.surface,
      paddingVertical: PortSpacing.tertiary.uniform,
    },
    buttonWrapper: {
      padding: PortSpacing.secondary.uniform,
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

export default ShareContact;
