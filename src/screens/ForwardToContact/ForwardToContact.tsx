import Send from '@assets/icons/NewSend.svg';
import ChatBackground from '@components/ChatBackground';
import {FontSizes, PortColors, screen} from '@components/ComponentUtils';
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
import {getConnections} from '@utils/Connections';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {getMessage} from '@utils/Storage/messages';
import React, {useEffect, useState} from 'react';
import {FlatList, ScrollView, StyleSheet, View} from 'react-native';
import ContactTile from './ContactTile';

type Props = NativeStackScreenProps<AppStackParamList, 'ForwardToContact'>;

export default function ForwardToContact({route, navigation}: Props) {
  const {messages = [], setSelectedMessages, chatId} = route.params;
  const [searchText, setSearchText] = useState('');

  //Members that have been selected via the checkbox
  const [selectedMembers, setSelectedMembers] = useState<ConnectionInfo[]>([]);

  //All members who can be invited
  const [allMembers, setAllMembers] = useState<ConnectionInfo[]>([]);

  //Members that have been searched for
  const [viewableMembers, setViewableMembers] = useState<ConnectionInfo[]>([]);

  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        loadConnections();
      })();
    }, []),
  );

  async function loadConnections() {
    setAllMembers(await getConnections());
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
        allMembers.filter(member => member.name.includes(searchText)),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const onForward = async () => {
    setLoading(true);
    for (const mbr of selectedMembers) {
      for (const id of messages) {
        const msg = await getMessage(chatId, id);
        if (msg) {
          const sender = new SendMessage(mbr.chatId, msg.contentType, msg.data);
          sender.send();
        }
      }
    }
    setLoading(false);
    //clearing selection so that chat bar returns
    setSelectedMessages([]);
    navigation.goBack();
  };

  // TODO: Remove all inline styles
  return (
    <SafeAreaView style={styles.profileScreen}>
      <ChatBackground />
      {/* TopBar */}
      <GenericTopBar
        title={'Forward to'}
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
          return <ContactTile member={item} onToggle={onMemberSelected} />;
        }}
      />

      {selectedMembers.length > 0 && (
        <View style={styles.selectedMembers}>
          <ScrollView
            horizontal
            contentContainerStyle={{
              columnGap: 8,
            }}
            showsHorizontalScrollIndicator={false}
            style={{
              width: screen.width - 130,
              marginRight: 16,
            }}>
            {selectedMembers.map(m => (
              <NumberlessText
                key={m.chatId}
                style={styles.selectedItemDisplay}
                fontSizeType={FontSizeType.s}
                fontType={FontType.md}
                textColor={PortColors.text.secondary}>
                {m.name}
              </NumberlessText>
            ))}
          </ScrollView>

          <GenericButton
            buttonStyle={styles.send}
            IconRight={Send}
            loading={loading}
            onPress={onForward}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  selectedMembers: {
    width: '100%',
    height: 90,
    backgroundColor: 'white',
    padding: 15,
    position: 'absolute',
    bottom: 0,
    flex: 1,
    flexDirection: 'row',
  },
  selectedItemDisplay: {
    backgroundColor: PortColors.primary.grey.light,
    borderRadius: 11,
    height: 36,
    overflow: 'hidden',
    marginTop: 5,
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 14,
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
  iconStyles: {alignSelf: 'flex-end'},
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
  memberName: {
    ...FontSizes[15].medium,
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
  send: {
    width: 50,
    height: 50,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PortColors.primary.blue.app,
  },
  content: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center',
    marginVertical: 8,
    marginLeft: 14,
  },
});
