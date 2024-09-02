import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import MultiSelectMembers from '@components/Reusable/MultiSelectMembers/MultiSelectMembers';
import SimpleTopbar from '@components/Reusable/TopBars/SimpleTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import React, {useEffect, useMemo, useState} from 'react';
import {KeyboardAvoidingView, StyleSheet, View} from 'react-native';

import {getConnections} from '@utils/Storage/connections';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '@navigation/AppStackTypes';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import SearchBar from '@components/SearchBar';

type Props = NativeStackScreenProps<AppStackParamList, 'SelectShareContacts'>;

const SelectShareContacts = ({route, navigation}: Props) => {
  const {shareMessages = [], isText = false} = route.params;
  //for loader used in the screen
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMembers, setSelectedMembers] = useState<ConnectionInfo[]>([]);
  const [allMembers, setAllMembers] = useState<ConnectionInfo[]>([]);
  const [viewableMembers, setViewableMembers] = useState<ConnectionInfo[]>([]);

  //search text
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    (async () => {
      const connections = await getConnections(true);
      setAllMembers(connections);
      setViewableMembers(connections);
    })();
  }, []);

  useMemo(() => {
    const filteredData = allMembers.filter(item => {
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
              buttonText={'Send'}
              onClick={async () => {
                if (isText) {
                  setLoading(true);
                  for (const mbr of selectedMembers) {
                    for (const data of shareMessages) {
                      const sender = new SendMessage(
                        mbr.chatId,
                        ContentType.text,
                        {
                          text: data,
                        },
                      );
                      await sender.send();
                    }
                  }
                  setLoading(false);
                  navigation.popToTop();
                } else {
                  navigation.navigate('GalleryConfirmation', {
                    selectedMembers,
                    shareMessages,
                    fromShare: true,
                  });
                }
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styling = (Color: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      alignSelf: 'center',
      justifyContent: 'flex-start',
      width: screen.width,
      backgroundColor: Color.primary.background,
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
      backgroundColor: Color.primary.surface,
      borderBottomColor: '#EEE',
      borderBottomWidth: 0.5,
      paddingVertical: PortSpacing.tertiary.uniform,
    },
    buttonWrapper: {
      padding: PortSpacing.secondary.uniform,
    },
    search: {
      backgroundColor: Color.primary.surface2,
      width: '100%',
      flexDirection: 'row',
      height: 44,
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: PortSpacing.tertiary.uniform,
    },
  });

export default SelectShareContacts;
