/**
 * The Home screen is where your all your connections are displayed, along with
 * a few other neat features
 */

import React, {useState} from 'react';
import ChatTile from '../../components/ChatTile/ChatTile';
import {SafeAreaView} from '../../components/SafeAreaView';
import {
  Connection,
  ConnectionType,
  getConnectionsOrdered,
} from '../../utils/Connection';
import {FlatList, StatusBar, StyleSheet, ImageBackground, View, Pressable} from 'react-native';
import Topbar from './Topbar';
import {BottomNavigator} from '../../components/BottomNavigator/BottomNavigator';
import {Page} from '../../components/BottomNavigator/Button';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import store from '../../store/appStore';
import {cancelAllNotifications} from '../../utils/notifications';
import { NumberlessItalicText } from '../../components/NumberlessText';
import DefaultChatTile from './DefaultChatTile';

function renderChatTile(connection: Connection) {
  return (
    <ChatTile
      nickname={connection.nickname}
      connectionType={connection.connectionType || ConnectionType.line}
      id={connection.id}
      text={connection.text}
      timeStamp={connection.timeStamp}
      newMessageCount={connection.newMessageCount}
      readStatus={connection.readStatus}
    />
  );
}

function renderDefaultTile(defaultTile: {id: string}) {
  return (
    <DefaultChatTile id={defaultTile.id}/>
    );
}

const defaultConnectionList = [
  {id: 'default'},
];

function Home() {
  const [connections, setConnections] = useState<Array<Connection>>([]);
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [latestMessage, setLatestMessage] = useState<Object>({});
  useFocusEffect(
    React.useCallback(() => {
      const countNewConnections = async () => {
        const connections = await getConnectionsOrdered();
        let count = 0;
        for (const connection of connections) {
          if (connection.readStatus === 'new') {
            count++;
          }
        }
        setConnections(connections);
        setTotalUnread(count);
      }
      countNewConnections();
      // Cancel all notifications when I land on the home screen
      cancelAllNotifications();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latestMessage]),
  );
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = store.subscribe(() => {
        setLatestMessage(store.getState().latestMessage);
      });
      // Clean up the subscription when the screen loses focus
      return () => {
        unsubscribe();
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      >
      </ImageBackground>
      <Topbar unread={totalUnread} filter="All" />
        {connections.length < 1 ? 
        (<FlatList
          data={defaultConnectionList}
          renderItem={element => renderDefaultTile(element.item)}
          style={styles.chats}
          keyExtractor={item => item.id}
        />) : 
        (<FlatList
          data={connections}
          renderItem={element => renderChatTile(element.item)}
          style={styles.chats}
          keyExtractor={connection => connection.id}
        />)}
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
    backgroundColor: '#EEE',
    opacity: 0.5,
    overflow: 'hidden',
  },
});

export default Home;
