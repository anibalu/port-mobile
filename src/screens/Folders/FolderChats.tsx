import {PortSpacing, isIOS} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import SearchBar from '@components/SearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import LinkSuperport from '@assets/light/icons/folders/LinkSuperport.svg';
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from 'react-native';
import ChatTile, {ChatTileProps} from '@components/ChatTile/ChatTile';
import {useBottomNavContext} from 'src/context/BottomNavContext';
import {GestureSafeAreaView} from '@components/GestureSafeAreaView';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {BOTTOMBAR_HEIGHT} from '@configs/constants';
import {FolderNavStackParamList} from '@navigation/BottomNavStackTypes';
import {useSelector} from 'react-redux';
import {loadFolderScreenConnections} from '@utils/Connections/onRefresh';
import {debouncedPeriodicOperations} from '@utils/AppOperations';
import {useTheme} from 'src/context/ThemeContext';
import {FolderChatsTopBar} from './FolderChatsTopBar';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {useListenForTrigger} from '@utils/TriggerTools/RedrawTriggerListener/useListenForTrigger';
import {TRIGGER_TYPES} from '@store/triggerRedraw';
import FolderOptionWithChevron from '@screens/DefaultFolderScreen/FolderOptionWithChevron';
import {countOfConnections} from '@utils/Storage/connections';
import {getFolder} from '@utils/Storage/folders';

type Props = NativeStackScreenProps<FolderNavStackParamList, 'FolderChats'>;

const FolderChats = ({route}: Props) => {
  const {folder} = route.params;
  const colors = DynamicColors();
  const styles = styling(colors);
  const ping: any = useSelector(state => state.ping.ping);
  const folderChangedTrigger = useListenForTrigger(TRIGGER_TYPES.FOLDER_UPDATE);

  const {
    setTotalFolderUnreadCount,
    folderConnections,
    setFolderConnections,
    selectedFolderData,
    setSelectedFolderData,
  } = useBottomNavContext();

  //loader that waits for folder screen to finish loading.
  const isLoading = useMemo(() => {
    if (folderConnections) {
      return false;
    } else {
      return true;
    }
  }, [folderConnections]);
  //subset of the connections that are viewable on homescreen.
  const [viewableConnections, setViewableConnections] = useState<
    ChatTileProps[]
  >(folderConnections || []);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  //connections displayed on home screen (depending on what the search string is).
  //If search string is empty, all connections are displayed

  const [searchText, setSearchText] = useState<string>('');

  //loads up connections
  useEffect(() => {
    if (selectedFolderData) {
      (async () => {
        const output = await loadFolderScreenConnections(
          selectedFolderData.folderId,
        );
        setFolderConnections(output.connections);
        setTotalFolderUnreadCount(output.unread);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ping, selectedFolderData]);

  useEffect(() => {
    (async () => {
      const newFolder = await getFolder(folder.folderId);
      setSelectedFolderData(newFolder ? newFolder : (folder as FolderInfo));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderChangedTrigger]);

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
      if (folderConnections) {
        if (searchText === '') {
          setViewableConnections(folderConnections);
        } else {
          setViewableConnections(
            getFilteredConnectionsBySearch(folderConnections),
          );
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderConnections, searchText]);

  //rendered chat tile of a connection
  function renderChatTile(connection: ChatTileProps): ReactElement {
    try {
      return <ChatTile props={connection} />;
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

  const {themeValue} = useTheme();
  const svgArray = [
    {
      assetName: 'MoveChats',
      light: require('@assets/light/icons/Movechats.svg').default,
      dark: require('@assets/dark/icons/Movechats.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const Movechats = results.MoveChats;
  const navigation = useNavigation();
  const [connectionsCount, setConnectionsCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setConnectionsCount(await countOfConnections());
      })();
    }, []),
  );
  const onClickAddChats = () => {
    if (connectionsCount === 0) {
      setSelectedFolderData(folder);
      navigation.navigate('FolderStack', {
        screen: 'NoConnectionsScreen',
      });
    } else {
      navigation.navigate('MoveToFolder', {
        selectedFolder: folder,
      });
    }
  };

  return (
    <>
      <CustomStatusBar backgroundColor={colors.primary.surface} />
      <GestureSafeAreaView
        removeOffset={true}
        style={{
          backgroundColor: colors.primary.background,
        }}>
        <FolderChatsTopBar />
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
                {folderConnections && folderConnections.length > 0 ? (
                  <FlatList
                    data={viewableConnections}
                    renderItem={element => renderChatTile(element.item)}
                    style={styles.chats}
                    scrollEnabled={viewableConnections.length > 0}
                    ListHeaderComponent={
                      folderConnections && folderConnections.length > 0 ? (
                        <View style={styles.barWrapper}>
                          <View
                            style={{
                              paddingHorizontal: PortSpacing.secondary.uniform,
                            }}>
                            <SearchBar
                              style={styles.search}
                              searchText={searchText}
                              setSearchText={setSearchText}
                              placeholder={'Search for chats in this folder'}
                            />
                          </View>

                          {folder.superportCount > 0 && (
                            <FolderOptionWithChevron
                              subtitle="Tap here to view linked Supeports"
                              text={`This folder is linked to ${
                                folder.superportCount
                              } ${
                                folder.superportCount > 1
                                  ? 'Superports'
                                  : 'Superport'
                              }`}
                              Icon={LinkSuperport}
                              onPress={() => {
                                navigation.navigate('Superports', {
                                  selectedFolderFilter: {...folder},
                                });
                              }}
                            />
                          )}
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
                      if (selectedFolderData) {
                        const output = await loadFolderScreenConnections(
                          selectedFolderData.folderId,
                        );
                        setFolderConnections(output.connections);
                        setTotalFolderUnreadCount(output.unread);
                      }
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
                          No matching chats found in this folder
                        </NumberlessText>
                      </View>
                    )}
                  />
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      marginHorizontal: PortSpacing.secondary.uniform,
                    }}>
                    <SimpleCard
                      style={{
                        paddingVertical: PortSpacing.secondary.uniform,
                      }}>
                      <NumberlessText
                        style={{
                          paddingHorizontal: PortSpacing.secondary.uniform,
                        }}
                        textColor={colors.text.primary}
                        fontSizeType={FontSizeType.xl}
                        fontType={FontType.sb}>
                        Looks like you haven’t added any chats yet
                      </NumberlessText>
                      <NumberlessText
                        style={{
                          paddingHorizontal: PortSpacing.secondary.uniform,
                        }}
                        textColor={colors.text.primary}
                        fontSizeType={FontSizeType.l}
                        fontType={FontType.rg}>
                        Choose an option below to add chats to this folder
                      </NumberlessText>
                      <FolderOptionWithChevron
                        text={`Move chats to ${folder.name}`}
                        subtitle="Tap here to move chats to this folder"
                        onPress={onClickAddChats}
                        Icon={Movechats}
                      />
                      <FolderOptionWithChevron
                        subtitle="Tap here to view linked Supeports"
                        text={'Tap here to link superports with this folder'}
                        Icon={LinkSuperport}
                        onPress={() => {
                          navigation.navigate('Superports', {
                            selectedFolderFilter: {...folder},
                          });
                        }}
                      />
                    </SimpleCard>
                  </View>
                )}
              </>
            )}
          </View>
        </KeyboardAvoidingView>
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
      paddingVertical: PortSpacing.tertiary.uniform,
      flexDirection: 'column',
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

export default FolderChats;
