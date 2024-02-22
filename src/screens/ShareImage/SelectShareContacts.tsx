import Send from '@assets/icons/WhiteArrowUp.svg';
import WhiteOverlay from '@assets/miscellaneous/whiteOverlay.svg';
import {PortColors} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import GenericTopBar from '@components/GenericTopBar';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import SearchBar from '@components/SearchBar';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AddMemberTile from '@screens/GroupScreens/AddMemberTile';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import {getDirectChats} from '@utils/DirectChats';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';

type Props = NativeStackScreenProps<AppStackParamList, 'SelectShareContacts'>;

const SelectShareContacts = ({route, navigation}: Props) => {
  const {shareMessages = [], isText = false} = route.params;

  const [searchText, setSearchText] = useState('');
  const [allMembers, setAllMembers] = useState<ConnectionInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewableMembers, setViewableMembers] = useState<ConnectionInfo[]>([]);
  //Members that have been selected via the checkbox
  const [selectedMembers, setSelectedMembers] = useState<ConnectionInfo[]>([]);
  //focus effect to load connections from cache and count unread connections
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        loadConnections();
      })();
    }, []),
  );

  async function loadConnections() {
    setAllMembers(await getDirectChats());
  }
  //Updates list of viewable members if new members are added to the list.
  useEffect(() => {
    setViewableMembers(allMembers);
  }, [allMembers]);

  const onMemberSelected = (member: ConnectionInfo) => {
    //If member exists, we remove
    if (selectedMembers.some(val => val.chatId === member.chatId)) {
      setSelectedMembers(oldList =>
        oldList.filter(val => val.chatId !== member.chatId),
      );
    } else {
      setSelectedMembers(oldList => [...oldList, member]);
    }
  };
  useEffect(() => {
    if (searchText === '' || searchText === undefined) {
      setViewableMembers(allMembers);
    } else {
      setViewableMembers(
        allMembers.filter(member =>
          member.name.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const renderTile = ({item}: {item: ConnectionInfo}) => {
    return <AddMemberTile member={item} onToggle={onMemberSelected} />;
  };

  const renderItemTile = ({item}: {item: ConnectionInfo}) => {
    return (
      <NumberlessText
        fontSizeType={FontSizeType.s}
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          padding: 10,
          borderRadius: 11,
          textAlign: 'center',
          backgroundColor: PortColors.primary.grey.light,
        }}
        textColor={PortColors.text.secondary}
        fontType={FontType.sb}>
        {item.name}
      </NumberlessText>
    );
  };

  const navigateToPreview = async () => {
    if (isText) {
      setLoading(true);
      for (const mbr of selectedMembers) {
        for (const data of shareMessages) {
          const sender = new SendMessage(mbr.chatId, ContentType.text, {
            text: data,
          });
          await sender.send();
        }
      }
      setLoading(false);
      navigation.popToTop();
    } else {
      navigation.navigate('GalleryConfirmation', {
        selectedMembers,
        shareMessages,
      });
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <GenericTopBar onBackPress={() => navigation.goBack()} title="Send to" />
      <View style={styles.main}>
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
      </View>
      <FlatList
        contentContainerStyle={{
          marginTop: 12,
        }}
        data={viewableMembers}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        keyExtractor={item => item.chatId}
        renderItem={renderTile}
      />
      {selectedMembers.length > 0 && (
        <View style={styles.bottombar}>
          <FlatList
            data={selectedMembers}
            horizontal={true}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
              columnGap: 8,
            }}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            keyExtractor={item => item.chatId}
            renderItem={renderItemTile}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0,
            }}>
            <WhiteOverlay style={{position: 'absolute', right: 2}} />
            <GenericButton
              onPress={navigateToPreview}
              iconSizeRight={14}
              IconRight={Send}
              loading={loading}
              buttonStyle={styles.button}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  main: {
    paddingHorizontal: 15,
    marginTop: 20,
  },
  bottombar: {
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingLeft: 15,
  },
  item: {
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#F6F6F6',
    paddingVertical: 10,
    justifyContent: 'center',
    marginRight: 10,
  },
  itemtext: {
    fontSize: 12,
    color: '#868686',
  },
  button: {
    marginLeft: 10,
    alignSelf: 'flex-end',
    marginRight: 15,
    borderRadius: 100,
  },
});

export default SelectShareContacts;
