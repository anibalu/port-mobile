/**
 * The Home screen is where your all your connections are displayed, along with
 * a few other neat features.
 * screen id: 5
 */
import React, {useState} from 'react';
import ChatTile from '../../components/ChatTile/ChatTile';
import {SafeAreaView} from '../../components/SafeAreaView';
import {FlatList, StatusBar, StyleSheet, ImageBackground} from 'react-native';
import Topbar from './Topbar';
import {BottomNavigator} from '../../components/BottomNavigator/BottomNavigator';
import {Page} from '../../components/BottomNavigator/Button';
import {useFocusEffect} from '@react-navigation/native';
import store from '../../store/appStore';
import {cancelAllNotifications} from '../../utils/Notifications';
import DefaultChatTile from './DefaultChatTile';
import {ConnectionInfo, ReadStatus} from '../../utils/Connections/interfaces';
import {getConnections} from '../../utils/Connections';

//rendered chat tile of a connection
function renderChatTile(connection: ConnectionInfo) {
  return <ChatTile {...connection} />;
}

//renders default chat tile when there are no connections to display
function renderDefaultTile() {
  return <DefaultChatTile />;
}

const defaultConnectionList = [{id: 'default'}];

function Home() {
  const [connections, setConnections] = useState<Array<ConnectionInfo>>(
    fetchStoreConnections(),
  );
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
      (async () => setConnections(await getConnections()))();
      // Cancel all notifications when I land on the home screen
      cancelAllNotifications();
    }, []),
  );

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
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      />
      <Topbar unread={totalUnread} filter="All" />
      {connections.length < 1 ? (
        <FlatList
          data={defaultConnectionList}
          renderItem={() => renderDefaultTile()}
          style={styles.chats}
          keyExtractor={item => item.id}
        />
      ) : (
        <FlatList
          data={connections}
          renderItem={element => renderChatTile(element.item)}
          style={styles.chats}
          keyExtractor={connection => connection.chatId}
        />
      )}
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
});

export default Home;
