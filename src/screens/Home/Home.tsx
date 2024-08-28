/**
 * The Home screen is where your all your connections are displayed, along with
 * a few other neat features.
 * screen id: 5
 */
import ChatTile, {ChatTileProps} from '@components/ChatTile/ChatTile';

import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {useFocusEffect} from '@react-navigation/native';
import {debouncedPeriodicOperations} from '@utils/AppOperations';
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Animated,
  Easing,
} from 'react-native';
import {useSelector} from 'react-redux';
import HomeTopbar from './HomeTopbar';
import HomescreenPlaceholder from './HomescreenPlaceholder';
import {PortSpacing, isIOS} from '@components/ComponentUtils';
import {BOTTOMBAR_HEIGHT} from '@configs/constants';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {useTheme} from 'src/context/ThemeContext';
import {performNotificationRouting, resetAppBadge} from '@utils/Notifications';
import {useBottomNavContext} from 'src/context/BottomNavContext';
import {GestureSafeAreaView} from '@components/GestureSafeAreaView';
import SearchBar from '@components/SearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BottomNavStackParamList} from '@navigation/BottomNavStackTypes';
import {loadHomeScreenConnections} from '@utils/Connections/onRefresh';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import LoadingBottomSheet from '@components/Reusable/BottomSheets/AddingContactBottomSheet';
import {cleanDeleteReadPort} from '@utils/Ports/direct';
import ContactSharingBottomsheet from '@components/Reusable/BottomSheets/ContactSharingBottomsheet';

type Props = NativeStackScreenProps<BottomNavStackParamList, 'Home'>;

const Home = ({navigation}: Props) => {
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

  const [isNotifPermissionGranted, setIsNotifPermissionGranted] =
    useState(false);

  //setup notification channels for the app. this also requests permissions.
  const setupNotificationChannels = async () => {
    // Needed for iOS
    await notifee.requestPermission();
    // Needed for Android
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
  };

  //checks if notification permission is granted
  async function checkNotificationPermission() {
    const settings = await notifee.getNotificationSettings();
    if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      setIsNotifPermissionGranted(true);
    } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
      setIsNotifPermissionGranted(false);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        // Attempt to get notification permissions from the user, if needed
        try {
          console.log({isNotifPermissionGranted});
          await setupNotificationChannels();
          await checkNotificationPermission();
        } catch (error) {
          console.log('Error occurred during setup:', error);
        }
        // Run basic periodic operations
        debouncedPeriodicOperations();
        // Set superport length to allow
        // Reset app badge information on iOS
        resetAppBadge();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  const colors = DynamicColors();
  const styles = styling(colors);
  const ping: any = useSelector(state => state.ping.ping);

  const {
    totalUnreadCount,
    setTotalUnreadCount,
    connections,
    setConnections,
    setSelectedFolderData,
    selectedProps,
    setSelectedProps,
    contactShareParams,
    setContactShareParams,
  } = useBottomNavContext();

  //loader that waits for home screen to finish loading.
  const isLoading = useMemo(() => {
    if (connections) {
      return false;
    } else {
      return true;
    }
  }, [connections]);

  //subset of the connections that are viewable on homescreen.
  const [viewableConnections, setViewableConnections] = useState<
    ChatTileProps[]
  >(connections || []);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  //connections displayed on home screen (depending on what the search string is).
  //If search string is empty, all connections are displayed

  const [searchText, setSearchText] = useState<string>('');

  //loads up connections
  useEffect(() => {
    (async () => {
      const output = await loadHomeScreenConnections();
      setConnections(output.connections);
      setTotalUnreadCount(output.unread);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ping]);

  useFocusEffect(
    useCallback(() => {
      setSelectedFolderData(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  //filter by search string
  const getFilteredConnectionsBySearch = (chats: ChatTileProps[]) => {
    const filteredSearch = chats.filter(connection =>
      connection.name.toLowerCase().includes(searchText.toLowerCase()),
    );
    return filteredSearch;
  };

  //sets up viewable connections
  useMemo(() => {
    (async () => {
      if (connections) {
        if (searchText === '') {
          setViewableConnections(connections);
        } else {
          setViewableConnections(getFilteredConnectionsBySearch(connections));
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections, searchText]);

  //rendered chat tile of a connection
  function renderChatTile(connection: ChatTileProps): ReactElement {
    try {
      return <ChatTile props={connection} />;
    } catch (error) {
      return <></>;
    }
  }

  const {themeValue} = useTheme();

  const opacityAnimation = useMemo(() => new Animated.Value(1), []);
  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnimation, {
          toValue: 0.5,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    if (isLoading) {
      breathingAnimation.start();
    } else {
      breathingAnimation.stop();
      opacityAnimation.setValue(1);
    }
    return () => {
      breathingAnimation.stop();
    };
  }, [isLoading, opacityAnimation]);

  return (
    <>
      <CustomStatusBar backgroundColor={colors.primary.surface} />
      <GestureSafeAreaView style={{backgroundColor: colors.primary.surface}}>
        <HomeTopbar unread={totalUnreadCount} />
        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : 'height'}
          keyboardVerticalOffset={isIOS ? 50 : 0}
          style={styles.scrollViewContainer}>
          <View style={{flex: 1}}>
            {isLoading ? (
              <Animated.View style={{opacity: opacityAnimation}}>
                <View style={styles.tilePlaceholderContainer}>
                  {Array.from({length: 10}).map((_, index) => (
                    <View
                      key={index}
                      style={StyleSheet.compose(styles.tilePlaceholder, {
                        backgroundColor:
                          themeValue === 'light' ? '#CFCCD6' : '#27272B',
                      })}
                    />
                  ))}
                </View>
              </Animated.View>
            ) : (
              <>
                {connections && connections.length > 0 ? (
                  <FlatList
                    data={viewableConnections}
                    renderItem={element => renderChatTile(element.item)}
                    style={styles.chats}
                    scrollEnabled={viewableConnections.length > 0}
                    ListHeaderComponent={
                      connections && connections.length > 0 ? (
                        <View style={styles.barWrapper}>
                          <SearchBar
                            style={styles.search}
                            searchText={searchText}
                            setSearchText={setSearchText}
                            placeholder={'Search for chats'}
                          />
                        </View>
                      ) : null
                    }
                    ListFooterComponent={
                      <View style={{height: BOTTOMBAR_HEIGHT}} />
                    }
                    refreshing={refreshing}
                    onRefresh={async () => {
                      setRefreshing(true);
                      await debouncedPeriodicOperations();
                      const output = await loadHomeScreenConnections();
                      setConnections(output.connections);
                      setTotalUnreadCount(output.unread);
                      setRefreshing(false);
                    }}
                    keyExtractor={connection => connection.chatId}
                    ListEmptyComponent={() => (
                      <View
                        style={{
                          height: 100,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <NumberlessText
                          textColor={colors.text.subtitle}
                          fontSizeType={FontSizeType.l}
                          fontType={FontType.rg}>
                          No matching chats found
                        </NumberlessText>
                      </View>
                    )}
                  />
                ) : (
                  <HomescreenPlaceholder />
                )}
              </>
            )}
          </View>
        </KeyboardAvoidingView>
        <LoadingBottomSheet
          visible={selectedProps ? true : false}
          onClose={() => setSelectedProps(null)}
          title={'Adding new contact...'}
          onStopPress={async () => {
            if (selectedProps?.isReadPort) {
              await cleanDeleteReadPort(selectedProps.chatId);
              const output = await loadHomeScreenConnections();
              setConnections(output.connections);
              setTotalUnreadCount(output.unread);
            }
          }}
        />
        {contactShareParams && (
          <ContactSharingBottomsheet
            visible={contactShareParams ? true : false}
            contactShareParams={contactShareParams}
            onClose={() => setContactShareParams(null)}
          />
        )}
      </GestureSafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    chats: {
      flex: 1,
      backgroundColor: colors.primary.surface,
    },
    isolationButton: {
      alignSelf: 'flex-end',
      position: 'absolute',
      bottom: PortSpacing.primary.bottom,
      left: PortSpacing.secondary.left,
      height: 56,
      width: 56,
    },
    barWrapper: {
      backgroundColor: colors.primary.surface,
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.tertiary.uniform,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    search: {
      backgroundColor: colors.primary.surface2,
      width: '100%',
      flexDirection: 'row',
      height: 44,
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: PortSpacing.tertiary.uniform,
    },
    tilePlaceholder: {
      height: 91,
      marginHorizontal: PortSpacing.tertiary.uniform,
      marginBottom: PortSpacing.tertiary.uniform,
      borderRadius: 16,
    },
    tilePlaceholderContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingVertical: PortSpacing.medium.uniform,
    },
    addButtonWrapper: {
      alignSelf: 'flex-end',
      position: 'absolute',
      bottom: PortSpacing.primary.bottom,
      right: PortSpacing.secondary.right,
      height: 56,
      width: 56,
    },
    scrollViewContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
  });

export default Home;
