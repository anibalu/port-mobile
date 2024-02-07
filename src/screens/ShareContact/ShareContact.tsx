import ChatBackground from '@components/ChatBackground';
import {FontSizes, PortColors} from '@components/ComponentUtils';
import GenericTopBar from '@components/GenericTopBar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import Send from '@assets/icons/WhiteArrowUp.svg';
import {SafeAreaView} from '@components/SafeAreaView';
import SearchBar from '@components/SearchBar';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import WhiteOverlay from '@assets/miscellaneous/whiteOverlay.svg';
import ContactTile from './ContactTile';
import {getDirectChats} from '@utils/DirectChats';
import {requestToShareContact} from '@utils/ContactSharing';
import {GenericButton} from '@components/GenericButton';

type Props = NativeStackScreenProps<AppStackParamList, 'ShareContact'>;

export default function ShareContact({route, navigation}: Props) {
  const {chatId} = route.params;
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  //Members that have been selected via the checkbox
  const [selectedMembers, setSelectedMembers] = useState<ConnectionInfo | null>(
    null,
  );

  //All members who can be invited
  const [allMembers, setAllMembers] = useState<ConnectionInfo[]>([]);

  //Members that have been searched for
  const [viewableMembers, setViewableMembers] = useState<ConnectionInfo[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setAllMembers(
          (await getDirectChats()).filter(
            chat => chat.chatId !== chatId && chat.authenticated,
          ),
        );
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  //Updates list of viewable members if new members are added to the list.
  useEffect(() => {
    setViewableMembers(allMembers);
  }, [allMembers]);

  useEffect(() => {
    if (searchText === '' || searchText === undefined) {
      setViewableMembers(allMembers);
    } else {
      setViewableMembers(
        allMembers.filter(member => member.name.includes(searchText)),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const onShareContact = async () => {
    if (selectedMembers) {
      setLoading(true);
      await requestToShareContact({
        source: selectedMembers.chatId,
        destination: chatId,
      });
      setSelectedMembers(null);
      setLoading(false);
      navigation.goBack();
    }
  };

  // TODO: Remove all inline styles
  return (
    <SafeAreaView style={styles.profileScreen}>
      <ChatBackground />
      {/* TopBar */}
      <GenericTopBar
        titleStyle={{...FontSizes[17].semibold}}
        title={'Share Contact of'}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      <View style={styles.searchContainer}>
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
      </View>
      <FlatList
        style={{width: '100%'}}
        contentContainerStyle={{marginTop: 12}}
        data={viewableMembers}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        keyExtractor={item => item.chatId}
        renderItem={({item}: {item: ConnectionInfo}) => {
          return (
            <ContactTile
              member={item}
              selectedMembers={selectedMembers}
              setSelectedMembers={setSelectedMembers}
            />
          );
        }}
      />

      {selectedMembers && (
        <View style={styles.selectedMembers}>
          <NumberlessText
            fontSizeType={FontSizeType.s}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.itemTile}
            textColor={PortColors.text.secondary}
            fontType={FontType.sb}>
            {selectedMembers.name}
          </NumberlessText>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0,
            }}>
            <WhiteOverlay
              style={{position: 'absolute', right: 2, bottom: -6}}
            />
            <GenericButton
              onPress={onShareContact}
              iconSizeRight={14}
              IconRight={Send}
              loading={loading}
              buttonStyle={StyleSheet.compose(
                styles.sendButton,
                loading && {padding: 12},
              )}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  selectedMembers: {
    width: '100%',
    backgroundColor: PortColors.primary.white,
    padding: 15,
    position: 'absolute',
    bottom: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
  },
  searchBox: {
    width: '95%',
    borderRadius: 8,
    flexDirection: 'row',
    paddingLeft: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  memberContainer: {flexDirection: 'row'},
  sendButton: {
    marginLeft: 10,
    alignSelf: 'flex-end',
    marginRight: 15,
    borderRadius: 100,
  },
  topBar: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 20,
  },
  backButton: {
    paddingHorizontal: 20,
  },
  header: {
    maxWidth: '80%',
  },
  itemCard: {
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 16,
    marginLeft: 14,
    width: '93%',
  },
  titleBox: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  profileScreen: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
  },
  itemTile: {
    padding: 10,
    borderRadius: 11,
    textAlign: 'center',
    backgroundColor: PortColors.primary.grey.light,
  },
  profile: {
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  profilePic: {
    width: 132,
    height: 132,
    borderRadius: 44,
    marginBottom: 10,
    marginRight: 10,
  },
  content: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center',
    marginVertical: 8,
    marginLeft: 14,
  },
});
