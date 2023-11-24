import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import BlueForwardIcon from '../../../assets/icons/BlueForwardIcon.svg';
import Search from '../../../assets/icons/search.svg';
import {BackButton} from '../../components/BackButton';
import {
  NumberlessMediumText,
  NumberlessSemiBoldText,
} from '../../components/NumberlessText';
import {SafeAreaView} from '../../components/SafeAreaView';
import {NAME_LENGTH_LIMIT} from '../../configs/constants';
import {AppStackParamList} from '../../navigation/AppStackTypes';
import {getConnections} from '../../utils/Connections';
import {
  ConnectionInfo,
  ConnectionType,
} from '../../utils/Connections/interfaces';
import {sendMessage} from '../../utils/Messaging/sendMessage';
import ContactTile from './ContactTile';
import {getMessage} from '../../utils/Storage/messages';

type Props = NativeStackScreenProps<AppStackParamList, 'ForwardToContact'>;

export default function ForwardToContact({route, navigation}: Props) {
  const {messages = [], setSelectedMessages, chatId} = route.params;
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const onChangeText = (newName: string) => {
    setSearchText(newName);
  };

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
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      />
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
        <View style={styles.searchBox}>
          <Search color={'grey'} />
          <TextInput
            style={styles.textInputStyles}
            textAlign="left"
            maxLength={NAME_LENGTH_LIMIT}
            placeholder={isFocused ? '' : 'Search'}
            placeholderTextColor="#BABABA"
            onChangeText={onChangeText}
            value={searchText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
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
  textInputStyles: {marginLeft: 20, flex: 1},
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
  background: {
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#F9F9F9',
    opacity: 0.5,
    overflow: 'hidden',
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
