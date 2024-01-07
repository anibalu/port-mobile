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
import CenterInformationModal from '@components/CenterInformationModal';
import OnboardingCarousel from '@components/InformationDisplay/OnboardingCarousel';
import {
  ConnectionInfo,
  ReadStatus,
  StoreConnection,
} from '@utils/Connections/interfaces';
import sendJournaled from '@utils/Messaging/Send/sendJournaled';
import {cancelAllNotifications} from '@utils/Notifications';
import {useReadBundles} from '@utils/Ports';
import React, {ReactElement, ReactNode, useEffect, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import DefaultChatTile from './DefaultChatTile';
import HomeTopbar from './HomeTopbar';

//rendered chat tile of a connection
function renderChatTile(connection: StoreConnection): ReactElement {
  try {
    const newConnection: ConnectionInfo = JSON.parse(
      connection.stringifiedConnection,
    );
    return <ChatTile {...newConnection} />;
  } catch (error) {
    return <></>;
  }
}

//renders default chat tile when there are no connections to display
function renderDefaultTile(): ReactNode {
  return <DefaultChatTile />;
}
function Home(): ReactNode {
  const [viewableConnections, setViewableConnections] = useState<
    StoreConnection[]
  >([]);
  const connections: StoreConnection[] = useSelector(
    state => state.connections.connections,
  );
  const showOnboardingInfo = useSelector(
    state => state.profile.showOnboardingInfo,
  );
  const [searchText, setSearchText] = useState('');

  const [totalUnread, setTotalUnread] = useState<number>(0);
  //focus effect to initial load connections and cancel all notifications when on home screen
  // Also attempt to send unsent messages
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        await sendJournaled();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        await useReadBundles();
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
          JSON.parse(member.stringifiedConnection)
            ?.name?.toLowerCase()
            .includes(searchText.toLowerCase()),
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  //focus effect to load connections from store and count unread connections when home screen is focused
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        //sets new unread count when store experiences a change.
        let count = 0;
        for (const connection of connections) {
          if (
            JSON.parse(connection.stringifiedConnection).readStatus ===
            ReadStatus.new
          ) {
            count++;
          }
        }
        setTotalUnread(count);
      })();
    }, [connections]),
  );

  return (
    <SafeAreaView>
      <ChatBackground />
      <HomeTopbar unread={totalUnread} toptitleMessage="All" />

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
      <CenterInformationModal visible={showOnboardingInfo} position="center">
        <OnboardingCarousel />
      </CenterInformationModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chats: {
    paddingHorizontal: 19,
  },
});

export default Home;
