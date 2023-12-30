import Send from '@assets/icons/NewSend.svg';
import {GenericButton} from '@components/GenericButton';
import GenericTopBar from '@components/GenericTopBar';
import {NumberlessMediumText} from '@components/NumberlessText';
import SearchBar from '@components/SearchBar';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import AddMemberTile from '@screens/GroupScreens/AddMemberTile';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import {getDirectChats} from '@utils/DirectChats';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';

type Props = NativeStackScreenProps<AppStackParamList, 'ShareImage'>;

const ShareImage = ({route, navigation}: Props) => {
  const {shareMessages = []} = route.params;

  const [searchText, setSearchText] = useState('');
  const [allMembers, setAllMembers] = useState<ConnectionInfo[]>([]);

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
      <View style={styles.item}>
        <NumberlessMediumText style={styles.itemtext} numberOfLines={1}>
          {item.name}
        </NumberlessMediumText>
      </View>
    );
  };

  const navigateToPreview = () => {
    navigation.navigate('GalleryConfirmation', {
      selectedMembers,
      shareMessages,
    });
  };

  return (
    <View style={styles.screen}>
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
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            keyExtractor={item => item.chatId}
            renderItem={renderItemTile}
          />
          <GenericButton
            onPress={navigateToPreview}
            IconLeft={Send}
            buttonStyle={styles.button}
          />
        </View>
      )}
    </View>
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
    paddingVertical: 15,
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
    alignSelf: 'flex-end',
    marginRight: 15,
  },
});

export default ShareImage;
