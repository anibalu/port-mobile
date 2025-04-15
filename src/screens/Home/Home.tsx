/**
 * The Home screen is where your all your connections are displayed, along with
 * a few other neat features.
 * screen id: 5
 */

import React, {useEffect, useMemo, useReducer, useState} from 'react';
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from 'react-native';

import notifee from '@notifee/react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';

import { isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {GestureSafeAreaView} from '@components/GestureSafeAreaView';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import LoadingBottomSheet from '@components/Reusable/BottomSheets/AddingContactBottomSheet';
import SearchBar from '@components/SearchBar';
import { Spacing } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

import {BOTTOMBAR_HEIGHT} from '@configs/constants';

import {BottomNavStackParamList} from '@navigation/AppStack/BottomNavStack/BottomNavStackTypes';

import {useCallContext} from '@screens/Calls/CallContext';
import NewConnectionsBottomsheet from '@screens/Home/components/CreateNewConnectionsBottomsheet';

import {performDebouncedCommonAppOperations} from '@utils/AppOperations';
import {loadHomeScreenConnections} from '@utils/Connections/onRefresh';
import {performNotificationRouting, resetAppBadge} from '@utils/Notifications';
import {cleanDeleteReadPort} from '@utils/Ports/direct';
import {ChatType} from '@utils/Storage/DBCalls/connections';

import {useTheme} from 'src/context/ThemeContext';

import HomescreenPlaceholder from './components/HomescreenPlaceholder';
import HomeTopbar from './components/HomeTopbar';
import Tile, {TileProps} from './Tile';


const MINIMUM_CONNECTIONS =2
type Props = NativeStackScreenProps<BottomNavStackParamList, 'Home'>;

type DisplayConnections = {
  _all: TileProps[];
  filter: string;
  matching: TileProps[];
  hasConnection: boolean;
  initialLoadComplete: boolean;
};

type ConnectionAction =
  | {
      event: 'updateAll';
      payload: TileProps[];
    }
  | {
      event: 'updateFilter';
      payload: string;
    };

/**
 * Reducer to manage connections in UI state
 * @param state
 * @param action
 * @returns updated state
 */
function connectionReducer(
  state: DisplayConnections,
  action: ConnectionAction,
) {
  const currentState = {...state};
  switch (action.event) {
    case 'updateAll':
      currentState._all = action.payload;
      currentState.initialLoadComplete = true;
      currentState.hasConnection = action.payload.length > 0;
      break;
    case 'updateFilter':
      currentState.filter = action.payload;
      break;
  }
  // Apply the filter
  if ('' === currentState.filter) {
    currentState.matching = currentState._all;
    return currentState;
  }
  currentState.matching = currentState._all.filter(connection =>
    connection.name.toLowerCase().includes(currentState.filter.toLowerCase()),
  );
  return currentState;
}

const Home = ({navigation, route}: Props) => {
  const {initialiseCallKeep} = useCallContext();
  // If we got here with an initial chat request, honour it
  useMemo(() => {
    if (route.params) {
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

  // Initialise our connections state
  const [connections, dispatchConnectionAction] = useReducer(
    connectionReducer,
    {
      _all: [],
      matching: [],
      filter: '',
      hasConnection: false,
      initialLoadComplete: false,
    },
  );

  // To track a selected port, helps with "Stop adding" and stuff
  const [selectedPortProps, setSelectedPortProps] = useState<
    (TileProps & {isReadPort: true}) | null
  >(null);
  const [_isChatActionBarVisible, setIsChatActionBarVisible] =
    useState<boolean>(false);

  // This is for the little loader when you pull down on the home screen
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [openConnectionsBottomsheet, setOpenConnectionsBottomsheet] =
    useState<boolean>(false);

  const svgArray = [
    {
      assetName: 'RoundPlus',
      light: require('@assets/light/icons/RoundPlus.svg').default,
      dark: require('@assets/dark/icons/RoundPlus.svg').default,
    },
    {
      assetName: 'HomePlaceholderIcon',
      light: require('@assets/light/icons/HomePlaceholderIcon.svg').default,
      dark: require('@assets/dark/icons/HomePlaceholderIcon.svg').default,
    },
  ];
  const svgResults = useSVG(svgArray);
  const RoundPlus = svgResults.RoundPlus;
  const HomePlaceholderIcon = svgResults.HomePlaceholderIcon;
  // loads up connections on every ping
  useEffect(() => {
    (async () => {
      dispatchConnectionAction({
        event: 'updateAll',
        payload: await loadHomeScreenConnections(),
      });
    })();
  }, [ping]);

  // This animation helps render placeholder tiles while connections load
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
    if (!connections.initialLoadComplete) {
      breathingAnimation.start();
    } else {
      breathingAnimation.stop();
      opacityAnimation.setValue(1);
    }
    return () => {
      breathingAnimation.stop();
    };
  }, [opacityAnimation, connections.initialLoadComplete]);

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
          unread={connections.matching.reduce(
            (acc, cur) => (acc += cur.newMessageCount),
            0,
          )}
          setIsChatActionBarVisible={setIsChatActionBarVisible}
          selectionMode={false} // TODO: remove this dependency on the topbar
          setSelectionMode={() => {}}
          selectedConnections={[]} // TODO remove dependency on this
          setSelectedConnections={() => {}}
        />
        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : 'height'}
          keyboardVerticalOffset={isIOS ? 50 : 0}
          style={styles.scrollViewContainer}>
          <View style={{flex: 1}}>
            {!connections.initialLoadComplete ? (
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
                {connections.hasConnection ? (
                  <FlatList
                    data={connections.matching}
                    renderItem={element => (
                      <Tile
                        {...element.item}
                        setSelectedPortProps={setSelectedPortProps}
                      />
                    )}
                    style={styles.chats}
                    scrollEnabled={connections.matching.length > 0}
                    ListHeaderComponent={
                      <View style={styles.barWrapper}>
                        <SearchBar
                          style={styles.search}
                          searchText={connections.filter}
                          setSearchText={(filter: string) =>
                            dispatchConnectionAction({
                              event: 'updateFilter',
                              payload: filter,
                            })
                          }
                          placeholder={'Search for chats'}
                        />
                      </View>
                    }
                    ListFooterComponent={connections.matching.length > MINIMUM_CONNECTIONS?
                      <View style={{height: BOTTOMBAR_HEIGHT}} />
                      : 
                      <View style={styles.homecard}>
                      <HomescreenPlaceholder 
                  onPlusPress={() => setOpenConnectionsBottomsheet(true)}
                  />
                        </View>          
                 
                    }
                    refreshing={refreshing}
                    onRefresh={async () => {
                      setRefreshing(true);
                      performDebouncedCommonAppOperations();
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
                          fontWeight={FontWeight.rg}
                       >
                          No matching chats found
                        </NumberlessText>
                      </View>
                    )}
                  />
                ) : (
                  <View style={styles.placeholdercard}>
          <HomePlaceholderIcon/>
                  <View style={styles.placeholder}>           
                  <HomescreenPlaceholder 
                  onPlusPress={() => setOpenConnectionsBottomsheet(true)}
                  />
                         </View>
                         </View>
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
          visible={selectedPortProps ? true : false}
          onClose={() => setSelectedPortProps(null)}
          title={'Adding new contact...'}
          onStopPress={async () => {
            await cleanDeleteReadPort(selectedPortProps!.chatId);
          }}
        />
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
      bottom: Spacing.xml,
      left: Spacing.l,
      height: 56,
      width: 56,
    },
    barWrapper: {
      backgroundColor:
        themeValue === 'dark'
          ? colors.primary.background
          : colors.primary.surface,
      paddingHorizontal: Spacing.l,
      paddingVertical:Spacing.s,
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
      paddingHorizontal: Spacing.s
    },
    tilePlaceholder: {
      height: 91,
      marginHorizontal: Spacing.s,
      marginBottom:Spacing.s,
      borderRadius: 16,
    },
    tilePlaceholderContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingVertical: Spacing.m
    },
    addButtonWrapper: {
      alignSelf: 'flex-end',
      position: 'absolute',
      bottom:Spacing.xml,
      right: Spacing.l,
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
      bottom: Spacing.l,
      right: Spacing.l,
    },
    placeholder:{
      position:'absolute', top: 400,
    },placeholdercard:{
      marginTop: Spacing.xl, 
                  marginHorizontal: Spacing.s
    },
    homecard:{
      position:'absolute', top: screen.height/5, marginHorizontal: Spacing.s, justifyContent:'center' 
    }
  });

export default Home;
