import React, {useEffect, useMemo, useState} from 'react';
import {KeyboardAvoidingView, StyleSheet, View} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import InviteMembers from '@components/Reusable/Cards/InviteMembers';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import MultiSelectMembers from '@components/Reusable/MultiSelectMembers/MultiSelectMembers';
import SimpleTopbar from '@components/Reusable/TopBars/SimpleTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import SearchBar from '@components/SearchBar';

import { AppStackParamList } from '@navigation/AppStack/AppStackTypes';

import {getDirectChats} from '@utils/DirectChats';
import Group from '@utils/Groups/GroupClass';
import {ContentType} from '@utils/Messaging/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';




type Props = NativeStackScreenProps<AppStackParamList, 'AddNewGroupMembers'>;

const AddNewGroupMembers = ({route, navigation}: Props) => {
  //for loader used in the screen
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {link, chatData, chatId} = route.params;
  const [selectedMembers, setSelectedMembers] = useState<ConnectionInfo[]>([]);
  const [members, setMembers] = useState<ConnectionInfo[]>([]);
  const [viewableMembers, setViewableMembers] = useState<ConnectionInfo[]>([]);

  //search text
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    (async () => {
      // gets connections
      const connections = await getDirectChats();
      const groupHandler = await Group.load(chatId);
      // gets existing members
      const existingMembers = await groupHandler.getGroupMembers();
      const existingPairHashes = new Set(
        existingMembers.map(member => member.pairHash),
      );
      // filters connections to have
      // members that are not already in the group
      const filteredConnections = connections.filter(
        connection => !existingPairHashes.has(connection.pairHash),
      );
      setMembers(filteredConnections);
      setViewableMembers(filteredConnections);
    })();
  }, [chatId]);

  useMemo(() => {
    // filters according to search
    const filteredData = members.filter(item => {
      return item.name.toLowerCase().includes(searchText.toLowerCase());
    });
    setViewableMembers(filteredData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const onAddMembers = async (selectedMembers: ConnectionInfo[]) => {
    selectedMembers.map(async member => {
      const sender = new SendMessage(member.chatId, ContentType.text, {
        text: `Join the group ${chatData.name}: ${link}`,
      });
      await sender.send();
    });

    navigation.navigate('HomeTab');
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
              : 'Add new members'
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
            <InviteMembers chatData={chatData} />
            <MultiSelectMembers
              showBackgroundColor={false}
              selectedMembers={selectedMembers}
              setSelectedMembers={setSelectedMembers}
              members={viewableMembers}
            />
          </View>
          <View style={styles.buttonWrapper}>
            <PrimaryButton
              isLoading={isLoading}
              disabled={selectedMembers.length === 0}
              primaryButtonColor="b"
              buttonText={'Add'}
              onClick={async () => {
                setIsLoading(true);
                await onAddMembers(selectedMembers);
                setIsLoading(false);
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

export default AddNewGroupMembers;
