/**
 * The Home screen is where your all your connections are displayed, along with
 * a few other neat features.
 * screen id: 5
 */
import ChatTile, {ChatTileProps, CompleteChatTileProps} from '@components/ChatTile/ChatTile';

import notifee from '@notifee/react-native';
import {useFocusEffect} from '@react-navigation/native';
import {performDebouncedCommonAppOperations} from '@utils/AppOperations';
import React, {ReactElement, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Animated,
  Easing,
} from 'react-native';
import {useSelector} from 'react-redux';
import HomeTopbar from './components/HomeTopbar';
import HomescreenPlaceholder from './components/HomescreenPlaceholder';
import {PortSpacing, isIOS} from '@components/ComponentUtils';
import {BOTTOMBAR_HEIGHT} from '@configs/constants';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {useTheme} from 'src/context/ThemeContext';
import {performNotificationRouting, resetAppBadge} from '@utils/Notifications';
import {GestureSafeAreaView} from '@components/GestureSafeAreaView';
import SearchBar from '@components/SearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BottomNavStackParamList} from '@navigation/AppStack/BottomNavStack/BottomNavStackTypes';
import {loadHomeScreenConnections} from '@utils/Connections/onRefresh';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import LoadingBottomSheet from '@components/Reusable/BottomSheets/AddingContactBottomSheet';
import {cleanDeleteReadPort} from '@utils/Ports/direct';
import ContactSharingBottomsheet from '@components/Reusable/BottomSheets/ContactSharingBottomsheet';
import {getConnections} from '@utils/Storage/connections';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import {useCallContext} from '@screens/Calls/CallContext';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import NewConnectionsBottomsheet from '@screens/Home/components/CreateNewConnectionsBottomsheet';

type Props = NativeStackScreenProps<BottomNavStackParamList, 'Home'>;

const Home = ({navigation, route}: Props) => {
  const {initialiseCallKeep} = useCallContext();
  useMemo(() => {
    if (route.params) {
      console.log(route.params);
      const {initialChatType, chatData} = route.params;
      if (ChatType.direct === initialChatType) {
        navigation.push('DirectChat', chatData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params]);

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

  // This useFocusEffect asks for permissions that are absolutely necessary in
  // A very annoying manner
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        // Call permissions to set up callkeep
        await initialiseCallKeep();

        performDebouncedCommonAppOperations();
        resetAppBadge();
      })();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const colors = DynamicColors();
  const {themeValue} = useTheme();
  const styles = styling(colors, themeValue);
  const ping: any = useSelector(state => state.ping.ping);

  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);
  const [connections, setConnections] = useState<ChatTileProps[] | null>(null);
  const [selectedProps, setSelectedProps] = useState<ChatTileProps | null>(
    null,
  );
  const [contactShareParams, setContactShareParams] = useState<{
    name: string;
    pairHash: string;
  } | null>(null);
  const [_connectionsNotInFocus, setConnectionsNotInFocus] = useState<number>(0);
  const [_isChatActionBarVisible, setIsChatActionBarVisible] =
    useState<boolean>(false);

  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedConnections, setSelectedConnections] = useState<
    ChatTileProps[]
  >([]);

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
  const [allConnections, setAllConnections] = useState<ChatTileProps[]>([]);

  //connections displayed on home screen (depending on what the search string is).
  //If search string is empty, all connections are displayed

  const [searchText, setSearchText] = useState<string>('');

  const [openConnectionsBottomsheet, setOpenConnectionsBottomsheet] =
    useState<boolean>(false);

  const svgArray = [
    {
      assetName: 'RoundPlus',
      light: require('@assets/light/icons/RoundPlus.svg').default,
      dark: require('@assets/dark/icons/RoundPlus.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const RoundPlus = results.RoundPlus;
  //loads up connections
  useEffect(() => {
    (async () => {
      const output = await loadHomeScreenConnections();
      const checkForConnections = await getConnections();
      setAllConnections(checkForConnections);
      if (checkForConnections.length !== output.connections.length) {
        setConnectionsNotInFocus(checkForConnections.length);
      }
      setConnections(output.connections);
      setTotalUnreadCount(output.unread);
    })();
  }, [ping]);

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
          setViewableConnections(
            getFilteredConnectionsBySearch(allConnections),
          );
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections, searchText]);

  //rendered chat tile of a connection
  function renderChatTile(props: CompleteChatTileProps): ReactElement {
    try {
      return <ChatTile {...props} />;
    } catch (error) {
      return <></>;
    }
  }

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
      <CustomStatusBar
        backgroundColor={
          themeValue === 'dark'
            ? colors.primary.background
            : colors.primary.surface
        }
      />
      <GestureSafeAreaView
        removeOffset={true}
        style={{
          backgroundColor:
            themeValue === 'dark'
              ? colors.primary.background
              : colors.primary.surface,
        }}>
        <HomeTopbar
          unread={totalUnreadCount}
          setIsChatActionBarVisible={setIsChatActionBarVisible}
          selectionMode={selectionMode}
          setSelectionMode={setSelectionMode}
          selectedConnections={selectedConnections}
          setSelectedConnections={setSelectedConnections}
        />
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
                    renderItem={element =>
                      renderChatTile({
                        ...element.item,
                        setSelectedProps,
                        selectedConnections,
                        setSelectedConnections,
                        selectionMode,
                        setSelectionMode,
                        setIsChatActionBarVisible,
                        setContactShareParams,
                      })
                    }
                    style={styles.chats}
                    scrollEnabled={viewableConnections.length > 0}
                    ListHeaderComponent={
                      connections && connections.length > 0 ? (
                        <>
                          <View style={styles.barWrapper}>
                            <SearchBar
                              style={styles.search}
                              searchText={searchText}
                              setSearchText={setSearchText}
                              placeholder={'Search for chats'}
                            />
                          </View>
                        </>
                      ) : null
                    }
                    ListFooterComponent={
                      <View style={{height: BOTTOMBAR_HEIGHT}} />
                    }
                    refreshing={refreshing}
                    onRefresh={async () => {
                      setRefreshing(true);
                      await performDebouncedCommonAppOperations();
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
        <RoundPlus
          onPress={() => {
            console.log('pressed');
            setOpenConnectionsBottomsheet(true);
          }}
          style={styles.plusButton}
        />
        <NewConnectionsBottomsheet
          visible={openConnectionsBottomsheet}
          onClose={() => setOpenConnectionsBottomsheet(false)}
          navigation={navigation}
        />
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

const styling = (colors: any, themeValue: any) =>
  StyleSheet.create({
    chats: {
      flex: 1,
      backgroundColor:
        themeValue === 'dark'
          ? colors.primary.background
          : colors.primary.surface,
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
      backgroundColor:
        themeValue === 'dark'
          ? colors.primary.background
          : colors.primary.surface,
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
    plusButton: {
      position: 'absolute',
      bottom: PortSpacing.secondary.uniform,
      right: PortSpacing.secondary.uniform,
    },
  });

export default Home;
