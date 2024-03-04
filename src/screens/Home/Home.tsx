/**
 * The Home screen is where your all your connections are displayed, along with
 * a few other neat features.
 * screen id: 5
 */
import ChatBackground from '@components/ChatBackground';
import BluePlusIcon from '../../../assets/icons/plusWhite.svg';
import ChatTile from '@components/ChatTile/ChatTile';
import {SafeAreaView} from '@components/SafeAreaView';
import SearchBar from '@components/SearchBar';

import notifee, {EventDetail, EventType} from '@notifee/react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
// import store from '@store/appStore';
// import {getConnections} from '@utils/Connections';
import CenterInformationModal from '@components/CenterInformationModal';
import OnboardingCarousel from '@components/InformationDisplay/OnboardingCarousel';
import {debouncedPeriodicOperations} from '@utils/AppOperations';
import {
  ConnectionInfo,
  ReadStatus,
  StoreConnection,
} from '@utils/Connections/interfaces';
import {useReadBundles} from '@utils/Ports';
import React, {ReactElement, ReactNode, useEffect, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import HomeTopbar from './HomeTopbar';
import HomescreenPlaceholder from './HomescreenPlaceholder';
import {GenericButton} from '@components/GenericButton';
import GenericBottomsheet from '@components/Modals/GenericBottomsheet';
import ConnectionOptions from './ConnectionOptions';
import {PortColors, screen} from '@components/ComponentUtils';
import {TOPBAR_HEIGHT} from '@configs/constants';
import SideDrawerWrapper from './SideDrawerWrapper';
import {CustomStatusBar} from '@components/CustomStatusBar';

//rendered chat tile of a connection
function renderChatTile(connection: StoreConnection): ReactElement {
  try {
    return <ChatTile {...connection} />;
  } catch (error) {
    return <></>;
  }
}

/**
 * Handles notification routing on tap
 * @param type
 * @param detail
 * @param navigation
 */
const performNotificationRouting = (
  type: EventType,
  detail: EventDetail,
  navigation: any,
) => {
  if (type === EventType.PRESS && detail.notification?.data) {
    const {chatId, isGroup, isConnected} = detail.notification.data;

    if (
      chatId != undefined &&
      isGroup != undefined &&
      isConnected != undefined
    ) {
      navigation.push('DirectChat', {
        chatId: chatId,
        isGroupChat: (isGroup as string).toLowerCase() === 'true',
        isConnected: (isConnected as string).toLowerCase() === 'true',
        profileUri: '',
      });
    }
  }
};

//renders default chat tile when there are no connections to display
function renderDefaultTile(): ReactNode {
  return <HomescreenPlaceholder />;
}

function Home(): ReactNode {
  const navigation = useNavigation<any>();
  const [viewableConnections, setViewableConnections] = useState<
    StoreConnection[]
  >([]);
  const connections: StoreConnection[] = useSelector(
    state => state.connections.connections,
  );
  const showOnboardingInfo = useSelector(
    state => state.profile.showOnboardingInfo,
  );
  const latestUpdatedSendStatus: any = useSelector(
    state => state.latestMessageUpdate.updatedStatus,
  );
  const [searchText, setSearchText] = useState('');

  const [totalUnread, setTotalUnread] = useState<number>(0);

  //focus effect to initial load connections and cancel all notifications when on home screen
  // Also attempt to send unsent messages
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await useReadBundles();
      })();
      debouncedPeriodicOperations();
    }, []),
  );

  //Sets up handlers to route notifications
  useEffect(() => {
    const foregroundHandler = notifee.onForegroundEvent(({type, detail}) => {
      //If data exists for the notification
      performNotificationRouting(type, detail, navigation);
    });

    notifee.onBackgroundEvent(async ({type, detail}) => {
      //If data exists for the notification
      performNotificationRouting(type, detail, navigation);
    });

    return () => {
      foregroundHandler();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (latestUpdatedSendStatus) {
      setViewableConnections(_ => {
        if (connections.length > 0) {
          const idx = connections.findIndex(
            item =>
              JSON.parse(item.stringifiedConnection).latestMessageId ===
              latestUpdatedSendStatus.messageId,
          );
          if (idx >= 0) {
            let connc = [...connections];
            let connectionData = JSON.parse(connc[idx].stringifiedConnection);
            connectionData = {
              ...connectionData,
              ...latestUpdatedSendStatus,
            } as ConnectionInfo;
            connc[idx].stringifiedConnection = JSON.stringify(connectionData);

            return connc;
          } else {
            return connections;
          }
        } else {
          return connections;
        }
      });
    } else {
      setViewableConnections(connections);
    }
  }, [connections, latestUpdatedSendStatus]);

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

  const [openSideDrawer, setOpenSideDrawer] = useState(false);
  const [isConnectionOptionsModalOpen, setIsConnectionOptionsModalOpen] =
    useState(false);

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView>
        <SideDrawerWrapper
          openSideDrawer={openSideDrawer}
          setOpenSideDrawer={setOpenSideDrawer}>
          <ChatBackground />
          <HomeTopbar
            openSideDrawer={openSideDrawer}
            setOpenSideDrawer={setOpenSideDrawer}
            unread={totalUnread}
            toptitleMessage="Primary"
          />
          <FlatList
            data={viewableConnections}
            renderItem={element => renderChatTile(element.item)}
            style={styles.chats}
            contentContainerStyle={
              viewableConnections.length > 0 && {
                rowGap: 8,
              }
            }
            ListHeaderComponent={
              connections.length >= 2 ? (
                /**
                 * @todo inline rendering is expensive, need to memoise and move outside. Haven't done so as it requires some finesse to allow focus to be retained
                 */
                <SearchBar
                  searchText={searchText}
                  setSearchText={setSearchText}
                />
              ) : (
                <></>
              )
            }
            keyExtractor={connection => connection.chatId}
            ListEmptyComponent={renderDefaultTile}
          />

          <GenericButton
            onPress={() => {
              setIsConnectionOptionsModalOpen(p => !p);
            }}
            iconSize={24}
            IconLeft={BluePlusIcon}
            buttonStyle={styles.addButtonWrapper}
          />
          {/* go to component isolation playground */}
          <GenericButton
            onPress={() => navigation.navigate('Isolation')}
            buttonStyle={styles.isolationButton}>
            🔑
          </GenericButton>
          <GenericBottomsheet
            showNotch={true}
            visible={isConnectionOptionsModalOpen}
            onClose={() => {
              setIsConnectionOptionsModalOpen(p => !p);
            }}>
            <ConnectionOptions
              setIsConnectionOptionsModalOpen={setIsConnectionOptionsModalOpen}
            />
          </GenericBottomsheet>
          <CenterInformationModal
            visible={showOnboardingInfo}
            position="center">
            <OnboardingCarousel />
          </CenterInformationModal>
        </SideDrawerWrapper>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  chats: {
    paddingHorizontal: 19,
    height: screen.height - TOPBAR_HEIGHT,
  },
  isolationButton: {
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 32,
    left: 19,
    height: 56,
    width: 56,
  },
  addButtonWrapper: {
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 32,
    right: 19,
    height: 56,
    width: 56,
  },
});

export default Home;
