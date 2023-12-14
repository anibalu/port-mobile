/**
 * The Home screen is where your all your connections are displayed, along with
 * a few other neat features.
 * screen id: 5
 */
import ChatBackground from '@components/ChatBackground';
import ChatTile from '@components/ChatTile/ChatTile';
import {SafeAreaView} from '@components/SafeAreaView';
import SearchBar from '@components/SearchBar';
import {useFocusEffect} from '@react-navigation/native';
// import store from '@store/appStore';
// import {getConnections} from '@utils/Connections';
import {ConnectionInfo, ReadStatus} from '@utils/Connections/interfaces';
import {tryToSendJournaled} from '@utils/Messaging/sendMessage';
import {cancelAllNotifications} from '@utils/Notifications';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import DefaultChatTile from './DefaultChatTile';
import Topbar from './Topbar';
import {useSelector} from 'react-redux';

//rendered chat tile of a connection
function renderChatTile(connection: ConnectionInfo) {
  return <ChatTile {...connection} />;
}

//renders default chat tile when there are no connections to display
function renderDefaultTile() {
  return <DefaultChatTile />;
}
function Home() {
  // const [connections, setConnections] = useState<Array<ConnectionInfo>>(
  //   fetchStoreConnections(),
  // );
  const [viewableConnections, setViewableConnections] = useState<
    ConnectionInfo[]
  >([]);
  const connections: ConnectionInfo[] = useSelector(
    state => state.connections.connections,
  );
  const [searchText, setSearchText] = useState('');

  const [totalUnread, setTotalUnread] = useState<number>(0);
  // function fetchStoreConnections() {
  //   const entireState = store.getState();
  //   const storeConnections: ConnectionInfo[] =
  //     entireState.connections.connections;
  //   return storeConnections;
  // }
  //focus effect to initial load connections and cancel all notifications when on home screen
  // Also attempt to send unsent messages
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        await tryToSendJournaled();
        //setConnections(await getConnections());
      })();
      // Cancel all notifications when I land on the home screen
      cancelAllNotifications();
    }, []),
  );

  useEffect(() => {
    setViewableConnections(connections);
  }, [connections]);

  useEffect(() => {
    if (searchText === '' || searchText === undefined) {
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
  // useFocusEffect(
  //   React.useCallback(() => {
  //     const unsubscribe = store.subscribe(async () => {
  //       //sets new connections
  //       const newConnections = await getConnections();
  //       setConnections(newConnections);
  //     });
  //     // Clean up the subscription when the screen loses focus
  //     return () => {
  //       unsubscribe();
  //     };
  //   }, []),
  // );

  //focus effect to load connections from store and count unread connections when home screen is focused
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        //sets new unread count when store experiences a change.
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

  return (
    <SafeAreaView style={styles.screen}>
      <ChatBackground />
      <Topbar unread={totalUnread} toptitleMessage="All" />
      <FlatList
        data={viewableConnections}
        renderItem={element => renderChatTile(element.item)}
        style={styles.chats}
        ListHeaderComponent={
          connections.length >= 2 ? (
            /**
             * @todo inline rendering is expensive, need to memoise and move outside. Haven't done so as it requires some finesse to allow focus to be retained
             */
            <SearchBar searchText={searchText} setSearchText={setSearchText} />
          ) : (
            <></>
          )
        }
        keyExtractor={connection => connection.chatId}
        ListEmptyComponent={renderDefaultTile}
      />
      {/* <BottomNavigator active={Page.home} /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
  },
  chats: {
    paddingLeft: 8,
    paddingRight: 8,
  },
});

export default Home;
