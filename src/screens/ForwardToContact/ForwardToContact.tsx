import BlueForwardIcon from '@assets/icons/BlueForwardIcon.svg';
import {BackButton} from '@components/BackButton';
import ChatBackground from '@components/ChatBackground';
import {
  NumberlessMediumText,
  NumberlessSemiBoldText,
} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';
import SearchBar from '@components/SearchBar';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getConnections} from '@utils/Connections';
import {ConnectionInfo, ConnectionType} from '@utils/Connections/interfaces';
import {sendMessage} from '@utils/Messaging/sendMessage';
import {getMessage} from '@utils/Storage/messages';
import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
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

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setAllMembers(await getConnections());
      })();
    }, []),
  );

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
    for (const mbr of selectedMembers) {
      const isGroup = mbr.connectionType === ConnectionType.group;
      for (const id of messages) {
        const msg = await getMessage(chatId, id);
        if (msg) {
          await sendMessage(
            mbr.chatId,
            {
              contentType: msg.contentType,
              data: msg.data,
            },
            true,
            isGroup,
          );
        }
      }
    }
    //clearing selection so that chat bar returns
    setSelectedMessages([]);
    navigation.goBack();
  };

  // TODO: Remove all inline styles
  return (
    <SafeAreaView style={styles.profileScreen}>
      <ChatBackground />
      {/* TopBar */}
      <View style={styles.topBar}>
        <BackButton
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        />
        <NumberlessSemiBoldText style={styles.header}>
          Forward to
        </NumberlessSemiBoldText>
        {/* Dummy view keeps title of screen centered */}
        <View style={styles.backButton} />
      </View>
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
        renderItem={(item: any) => {
          return <ContactTile member={item.item} onToggle={onMemberSelected} />;
        }}
      />
      {selectedMembers.length > 0 && (
        <View style={styles.selectedMembers}>
          <View style={{width: '90%', flexDirection: 'row'}}>
            {selectedMembers.map(members => {
              const {name} = members;
              return (
                <View style={styles.memberContainer}>
                  <NumberlessMediumText style={styles.memberName}>
                    {name}
                    {selectedMembers.length > 1 ? ', ' : ''}
                  </NumberlessMediumText>
                </View>
              );
            })}
          </View>

          <Pressable style={styles.iconStyles} onPress={onForward}>
            <BlueForwardIcon />
          </Pressable>
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
    fontSize: 15,
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
  content: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center',
    marginVertical: 8,
    marginLeft: 14,
  },
});
