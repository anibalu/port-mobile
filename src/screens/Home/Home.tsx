/**
 * The Home screen is where your all your connections are displayed, along with
 * a few other neat features.
 * screen id: 5
 */
import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  ImageBackground,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Search from '../../../assets/icons/GreySearch.svg';
import {BottomNavigator} from '../../components/BottomNavigator/BottomNavigator';
import {Page} from '../../components/BottomNavigator/Button';
import ChatTile from '../../components/ChatTile/ChatTile';
import {SafeAreaView} from '../../components/SafeAreaView';
import store from '../../store/appStore';
import {cancelAllNotifications} from '../../utils/Notifications';
import DefaultChatTile from './DefaultChatTile';
import {ConnectionInfo, ReadStatus} from '../../utils/Connections/interfaces';
import {getConnections} from '../../utils/Connections';
import {tryToSendJournaled} from '../../utils/Messaging/sendMessage';
import Topbar from './Topbar';
import {NAME_LENGTH_LIMIT} from '../../configs/constants';
// import {NativeStackScreenProps} from '@react-navigation/native-stack';
// import {AppStackParamList} from '../../navigation/AppStackTypes';

//type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

//rendered chat tile of a connection
function renderChatTile(connection: ConnectionInfo) {
  return <ChatTile {...connection} />;
}

//renders default chat tile when there are no connections to display
function renderDefaultTile() {
  return <DefaultChatTile />;
}
function Home() {
  const [connections, setConnections] = useState<Array<ConnectionInfo>>(
    fetchStoreConnections(),
  );
  const [viewableConnections, setViewableConnections] = useState<
    ConnectionInfo[]
  >([]);

  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const [totalUnread, setTotalUnread] = useState<number>(0);
  function fetchStoreConnections() {
    const entireState = store.getState();
    const storeConnections: ConnectionInfo[] =
      entireState.connections.connections;
    return storeConnections;
  }
  //focus effect to initial load connections and cancel all notifications when on home screen
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        await tryToSendJournaled();
        setConnections(await getConnections());
      })();
      // Cancel all notifications when I land on the home screen
      cancelAllNotifications();
    }, []),
  );

  useEffect(() => {
    setViewableConnections(connections);
  }, [connections]);

  useEffect(() => {
    if (searchText === '' || searchText == undefined) {
      setViewableConnections(connections);
    } else {
      setViewableConnections(
        connections.filter(member =>
          member?.name?.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  //focus effect to reload connection whenever store changes
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = store.subscribe(async () => {
        //sets new connections
        const newConnections = await getConnections();
        setConnections(newConnections);
      });
      // Clean up the subscription when the screen loses focus
      return () => {
        unsubscribe();
      };
    }, []),
  );

  //focus effect to load connections from store and count unread connections when home screen is focused
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        //sets new unread count when store experiences a change.
        console.log('unread count processed again');
        let count = 0;
        for (const connection of connections) {
          if (connection.readStatus === ReadStatus.new) {
            count++;
          }
        }
        setTotalUnread(count);
      })();
    }, [connections]),
  );

  const onChangeText = (newName: string) => {
    setSearchText(newName);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      />
      <Topbar unread={totalUnread} filter="All" />
      <FlatList
        data={viewableConnections}
        renderItem={element => renderChatTile(element.item)}
        style={styles.chats}
        ListHeaderComponent={
          connections.length >= 2 ? (
            /**
             * @todo inline rendering is expensive, need to memoise and move outside. Haven't done so as it requires some finesse to allow focus to be retained
             */
            <View style={styles.searchBarStyle}>
              <Search color={'grey'} />
              <TextInput
                style={{marginLeft: 20, flex: 1}}
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
          ) : (
            <></>
          )
        }
        keyExtractor={connection => connection.chatId}
        ListEmptyComponent={renderDefaultTile}
      />
      <BottomNavigator active={Page.home} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
  },
  chats: {
    paddingLeft: '3%',
    paddingRight: '3%',
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#FFF',
    opacity: 0.5,
    overflow: 'hidden',
  },
  searchBarStyle: {
    width: '100%',
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 4,
    paddingLeft: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default Home;
