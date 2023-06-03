/**
 * The Home screen is where your all your connections are displayed, along with
 * a few other neat features
 */

import React, {useEffect, useState} from 'react';
import ChatTile from '../../components/ChatTile/ChatTile';
import {SafeAreaView} from '../../components/SafeAreaView';
import {
  Connection,
  ConnectionType,
  getConnections,
} from '../../utils/Connection';
import {FlatList, StatusBar, StyleSheet} from 'react-native';
import Topbar from './Topbar';
import {BottomNavigator} from '../../components/BottomNavigator/BottomNavigator';
import {Page} from '../../components/BottomNavigator/Button';

function renderChatTile(connection: Connection) {
  return (
    <ChatTile
      nickname={connection.nickname}
      connectionType={connection.connectionType || ConnectionType.line}
      id={connection.id}
      text={connection.text}
      timeStamp={connection.timeStamp}
      newMessageCount={connection.newMessageCount}
    />
  );
}

function Home() {
  const [connections, setConnections] = useState<Array<Connection>>([]);
  useEffect(() => {
    (async () => {
      setConnections(await getConnections());
    })();
  }, []);

  // Sum over all the newMessagteCounts
  const totalUnread = connections.reduce(
    (runningSum, connection) =>
      runningSum + ((connection.newMessageCount || 0) > 0 ? 1 : 0),
    0,
  );

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Topbar unread={totalUnread} filter="All" />
      <FlatList
        data={connections}
        renderItem={element => renderChatTile(element.item)}
        style={styles.chats}
      />
      <BottomNavigator active={Page.home} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEE',
  },
  chats: {
    paddingLeft: '3%',
    paddingRight: '3%',
  },
});

export default Home;
