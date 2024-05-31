import {
  PortColors,
  PortSpacing,
  isIOS,
  screen,
} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import MultiSelectMembers from '@components/Reusable/MultiSelectMembers/MultiSelectMembers';
import SimpleTopbar from '@components/Reusable/TopBars/SimpleTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import React, {useEffect, useMemo, useState} from 'react';
import {KeyboardAvoidingView, StyleSheet, View, ScrollView} from 'react-native';
import BackIcon from '@assets/icons/navigation/BlackArrowLeftThin.svg';
import SearchIcon from '@assets/icons/searchThin.svg';
import {TOPBAR_HEIGHT} from '@configs/constants';
import {getConnections} from '@utils/Connections';
import SearchBar from '@components/Reusable/TopBars/SearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '@navigation/AppStackTypes';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';

type Props = NativeStackScreenProps<AppStackParamList, 'SelectShareContacts'>;

const SelectShareContacts = ({route, navigation}: Props) => {
  const {shareMessages = [], isText = false} = route.params;
  //for loader used in the screen
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMembers, setSelectedMembers] = useState<ConnectionInfo[]>([]);
  const [allMembers, setAllMembers] = useState<ConnectionInfo[]>([]);
  const [viewableMembers, setViewableMembers] = useState<ConnectionInfo[]>([]);

  const [isSearchActive, setIsSearchActive] = useState(false);
  //search text
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    (async () => {
      const connections = await getConnections();
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

  return (
    <>
      <CustomStatusBar backgroundColor={PortColors.primary.white} />
      <SafeAreaView style={styles.screen}>
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
            heading={
              selectedMembers.length > 0
                ? `Selected ${selectedMembers?.length}`
                : 'Select members'
            }
          />
        )}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    width: screen.width,
    backgroundColor: PortColors.background,
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
    backgroundColor: PortColors.primary.white,
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: TOPBAR_HEIGHT,
  },
  buttonWrapper: {
    paddingVertical: PortSpacing.secondary.top,
  },
});

export default SelectShareContacts;
