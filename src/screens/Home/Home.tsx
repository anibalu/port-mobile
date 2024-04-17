/**
 * The Home screen is where your all your connections are displayed, along with
 * a few other neat features.
 * screen id: 5
 */
import BluePlusIcon from '../../../assets/icons/plusWhite.svg';
import ChatTile, {ChatTileProps} from '@components/ChatTile/ChatTile';
import {SafeAreaView} from '@components/SafeAreaView';

import notifee, {EventDetail, EventType} from '@notifee/react-native';
import {useFocusEffect} from '@react-navigation/native';
import {debouncedPeriodicOperations} from '@utils/AppOperations';
import {
  ChatType,
  ConnectionInfo,
  ReadStatus,
} from '@utils/Connections/interfaces';
import {
  bundleTargetToChatType,
  getAllCreatedSuperports,
  getReadPorts,
  numberOfPendingRequests,
} from '@utils/Ports';
import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Animated,
} from 'react-native';
import {useSelector} from 'react-redux';
import HomeTopbar from './HomeTopbar';
import HomescreenPlaceholder from './HomescreenPlaceholder';
import {GenericButton} from '@components/GenericButton';
import ConnectionOptions from './ConnectionOptions';
import {
  PortColors,
  PortSpacing,
  isIOS,
  screen,
} from '@components/ComponentUtils';
import {
  DEFAULT_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  SIDE_DRAWER_WIDTH,
  defaultFolderId,
  defaultFolderInfo,
  safeModalCloseDuration,
} from '@configs/constants';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {getProfileName, getProfilePicture} from '@utils/Profile';
import {FileAttributes} from '@utils/Storage/interfaces';
import {FolderInfo, FolderInfoWithUnread} from '@utils/ChatFolders/interfaces';
import {getAllFoldersWithUnreadCount} from '@utils/ChatFolders';
import {getConnections, getNewMessageCount} from '@utils/Connections';
import FolderScreenPlaceholder from './FolderScreenPlaceholder';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {ContentType} from '@utils/Messaging/interfaces';
import {hasExpired, wait} from '@utils/Time';
import ErrorAddingContactBottomSheet from '@components/Reusable/BottomSheets/ErrorAddingContactBottomSheet';
import LoadingBottomSheet from '@components/Reusable/BottomSheets/AddingContactBottomSheet';
import DirectChat from '@utils/DirectChats/DirectChat';
import {cleanDeleteReadPort} from '@utils/Ports/direct';
import {useConnectionModal} from 'src/context/ConnectionModalContext';
import ErrorSimpleBottomSheet from '@components/Reusable/BottomSheets/ErrorSimpleBottomSheet';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {GestureHandlerRootView, Swipeable} from 'react-native-gesture-handler';
import SideDrawer from './SideDrawer';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {ChatActionsBar} from './ChatActionsBar';
import ConfirmationBottomSheet from '@components/Reusable/BottomSheets/ConfirmationBottomSheet';
import MoveToFolder from '@components/Reusable/BottomSheets/MoveToFolderBottomsheet';

//Handles notification routing on tapping notification
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
function renderDefaultTile(
  name: string,
  profilePicAttr: FileAttributes,
  selectedFolderData: FolderInfo,
): ReactNode {
  if (
    selectedFolderData.folderId === defaultFolderId ||
    selectedFolderData.folderId === 'all'
  ) {
    return (
      <HomescreenPlaceholder name={name} profilePicAttr={profilePicAttr} />
    );
  } else {
    return (
      <FolderScreenPlaceholder
        name={name}
        profilePicAttr={profilePicAttr}
        selectedFolderData={selectedFolderData}
      />
    );
  }
}

type Props = NativeStackScreenProps<AppStackParamList, 'HomeTab'>;

function Home({route, navigation}: Props) {
  const ping: any = useSelector(state => state.ping.ping);
  const params = route.params;
  const [name, setName] = useState<string>(DEFAULT_NAME);
  const [profilePicAttr, setProfilePicAttr] = useState(
    DEFAULT_PROFILE_AVATAR_INFO,
  );
  const [folders, setFolders] = useState<FolderInfoWithUnread[]>([]);
  //sets selected folder info
  const [selectedFolderData, setSelectedFolderData] = useState<FolderInfo>({
    ...defaultFolderInfo,
  });
  const [refreshing, setRefreshing] = useState<boolean>(false);
  //all connections available
  const [connections, setConnections] = useState<ChatTileProps[]>([]);
  //connections displayed on home screen (depending on what the search string is).
  //If search string is empty, all connections are displayed
  const [viewableConnections, setViewableConnections] = useState<
    ChatTileProps[]
  >([]);

  //whether the screen is in selection mode
  const [selectionMode, setSelectionMode] = useState(false);

  //selected connection Ids
  const [selectedConnections, setSelectedConnections] = useState<
    ChatTileProps[]
  >([]);

  const [searchText, setSearchText] = useState<string>('');
  //total unread messages
  const [totalUnread, setTotalUnread] = useState<number>(0);

  //controls failed modal
  const [openFailedModal, setOpenFailedModal] = useState(false);
  //controls adding new contact modal
  const [openAddingNewContactModal, setOpenAddingNewContactModal] =
    useState(false);
  const [selectedProps, setSelectedProps] = useState<ChatTileProps | null>(
    null,
  );
  const [searchReturnedNull, setSearchReturnedNull] = useState(false);

  const getUnread = (folderId: string) => {
    const found = folders.find(item => item.folderId === folderId);
    if (found) {
      setTotalUnread(found.unread);
    }
  };
  //loads up initial user name, profile picture
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const profilePictureURI = await getProfilePicture();
          const fetchedName = await getProfileName();
          setName(fetchedName);
          setProfilePicAttr(profilePictureURI);
        } catch (error) {
          console.log('Error fetching user details', error);
        }
      })();
    }, []),
  );

  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);

  const onRefresh = async () => {
    try {
      const fetchedFolders = await getAllFoldersWithUnreadCount();
      const allUnreadCount = await getNewMessageCount();
      setTotalUnreadCount(allUnreadCount);
      const fetchedFoldersWithAll = [
        {
          name: 'All Chats',
          folderId: 'all',
          permissionsId: 'all',
          unread: allUnreadCount,
        },
        ...fetchedFolders,
      ];
      setFolders(fetchedFoldersWithAll);
      //fetch all connections
      const fetchedConnections: ChatTileProps[] = await getConnections();
      //fetch all read ports
      const fetchedReadPorts: ChatTileProps[] = (await getReadPorts()).map(
        port => {
          return {
            chatId: port.portId,
            connectionType: bundleTargetToChatType(port.target),
            name: port.name,
            recentMessageType: ContentType.newChat,
            readStatus: ReadStatus.new,
            authenticated: false,
            timestamp: port.usedOnTimestamp,
            newMessageCount: 0,
            folderId: port.folderId,
            isReadPort: true,
            expired: hasExpired(port.expiryTimestamp),
          };
        },
      );
      const newArray = fetchedConnections
        .concat(fetchedReadPorts)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
      //stitch them together
      setConnections(newArray);
    } catch (error) {
      console.log('Error connections or folders', error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      debouncedPeriodicOperations();
    }, []),
  );
  //loads up connections and available folders
  useFocusEffect(
    React.useCallback(() => {
      onRefresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ping]),
  );

  //sets up selected folder
  useMemo(() => {
    if (selectedProps) {
      if (selectedProps.expired) {
        //open failure modal
        setOpenFailedModal(true);
      } else {
        //open adding new contact modal
        setOpenAddingNewContactModal(true);
      }
    }
  }, [selectedProps]);

  const onStopAddingPress = async (props: ChatTileProps) => {
    try {
      if (props.isReadPort) {
        //delete read port
        await cleanDeleteReadPort(props.chatId);
      } else {
        //delete unauthenticated chat
        if (props.connectionType === ChatType.direct) {
          const chatHandler = new DirectChat(props.chatId);
          await chatHandler.delete();
        }
      }
      setSelectedConnections([]);
      setSelectionMode(false);
    } catch (error) {
      console.log('Error stopping adding process', error);
    }
    await onRefresh();
  };

  //filter by folder
  const getFilteredConnectionsByFolder = (chats: ConnectionInfo[]) => {
    if (selectedFolderData.folderId === 'all') {
      return chats;
    } else {
      return chats.filter(
        connection => connection.folderId === selectedFolderData.folderId,
      );
    }
  };

  //filter by search string
  const getFilteredConnectionsBySearch = (chats: ConnectionInfo[]) => {
    setSearchReturnedNull(false);
    const filteredSearch = chats.filter(connection =>
      connection.name.toLowerCase().includes(searchText.toLowerCase()),
    );
    if (filteredSearch.length === 0) {
      setSearchReturnedNull(true);
    }
    return filteredSearch;
  };

  //sets up selected folder
  useMemo(() => {
    if (params) {
      if (params.selectedFolder) {
        setSelectedFolderData(params.selectedFolder);
      }
    }
  }, [params]);

  //sets up viewable connections
  useMemo(() => {
    if (searchText === '') {
      setSearchReturnedNull(false);
      setViewableConnections(getFilteredConnectionsByFolder(connections));
    } else {
      setViewableConnections(getFilteredConnectionsBySearch(connections));
    }
    getUnread(selectedFolderData.folderId);
    // eslint-disable-next-line
  }, [connections, selectedFolderData, searchText]);

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
    // eslint-disable-next-line
  }, []);

  //control whether connections modal is open
  const [isConnectionOptionsModalOpen, setIsConnectionOptionsModalOpen] =
    useState(false);

  const [pendingRequestsLength, setPendingRequestsLength] = useState(0);
  const [superportsLength, setSuperportsLength] = useState(0);

  //re-count pending requests length if triggered
  const reloadTrigger = useSelector(
    state => state.triggerPendingRequestsReload.change,
  );
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setPendingRequestsLength(await numberOfPendingRequests());
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadTrigger]),
  );

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setSuperportsLength((await getAllCreatedSuperports()).length);
      })();
    }, []),
  );
  const [moveToFolderSheet, setMoveToFolderSheet] = useState(false);
  const [confirmSheetDelete, setConfirmSheetDelete] = useState(false);
  const [confirmSheet, setConfirmSheet] = useState(false);

  //responsible for providing information about what kind of error occured while trying to connect with a link.
  const {linkUseError, setLinkUseError} = useConnectionModal();
  //show link use error modal
  const [openLinkUseErrorModal, setOpenLinkUseErrorModal] = useState(false);
  //close all other modal before opening this modal
  const cleanOpenLinkUseErrorModal = async () => {
    setSelectedConnections([]);
    setSelectionMode(false);
    setIsConnectionOptionsModalOpen(false);
    setOpenFailedModal(false);
    setOpenAddingNewContactModal(false);
    setOpenLinkUseErrorModal(false);
    setConfirmSheet(false);
    setConfirmSheetDelete(false);
    setMoveToFolderSheet(false);
    await wait(safeModalCloseDuration);
    setOpenLinkUseErrorModal(true);
  };
  const getLinkUseErrorDescription = () => {
    switch (linkUseError) {
      case 1:
        return 'Please check your internet connection and try clicking on the link again.';
      case 2:
        return 'This Port link has expired or has already been used. Please try again with a valid Port link.';
      default:
        return 'Nothing went wrong';
    }
  };
  //sets up selected folder
  useMemo(() => {
    if (linkUseError) {
      cleanOpenLinkUseErrorModal();
    }
  }, [linkUseError]);

  const insets = useSafeAreaInsets();
  const swipeableRef = useRef(null);
  const openSwipeable = () => {
    if (swipeableRef.current) {
      swipeableRef.current.openLeft();
    }
  };
  const closeSwipeable = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
  };

  const openRightModal = () => {
    if (selectedConnections[0]) {
      if (selectedConnections[0].isReadPort) {
        //open adding new contact modal
        setOpenAddingNewContactModal(true);
      } else {
        if (selectedConnections[0].connectionType === ChatType.direct) {
          if (selectedConnections[0].authenticated) {
            if (selectedConnections[0].disconnected) {
              setConfirmSheetDelete(true);
            } else {
              setConfirmSheet(true);
            }
          } else {
            //open adding new contact modal
            setOpenAddingNewContactModal(true);
          }
        }
      }
    }
  };

  //rendered chat tile of a connection
  function renderChatTile(connection: ChatTileProps): ReactElement {
    try {
      return (
        <ChatTile
          props={connection}
          setSelectedProps={setSelectedProps}
          selectedConnections={selectedConnections}
          setSelectedConnections={setSelectedConnections}
          selectionMode={selectionMode}
          setSelectionMode={setSelectionMode}
        />
      );
    } catch (error) {
      return <></>;
    }
  }

  const showPrompt = useMemo(() => {
    if (selectedFolderData.folderId === 'all') {
      return false;
    } else if (totalUnreadCount > 0) {
      return !folders.some(
        folder =>
          folder.folderId === selectedFolderData.folderId && folder.unread > 0,
      );
    } else {
      return false;
    }
  }, [totalUnreadCount, folders, selectedFolderData]);

  return (
    <GestureHandlerRootView>
      <Swipeable
        ref={swipeableRef}
        overshootLeft={false}
        leftThreshold={SIDE_DRAWER_WIDTH / 2}
        enabled={!selectionMode}
        renderLeftActions={(progress, dragX) => {
          const trans = dragX.interpolate({
            inputRange: [0, SIDE_DRAWER_WIDTH],
            outputRange: [-SIDE_DRAWER_WIDTH, 0],
          });
          return (
            <Animated.View
              style={[
                {width: SIDE_DRAWER_WIDTH},
                {
                  transform: [{translateX: trans}],
                },
              ]}>
              <SideDrawer
                selectedFolderData={selectedFolderData}
                setSelectedFolderData={setSelectedFolderData}
                closeSwipeable={closeSwipeable}
                folders={folders}
                name={name}
                profilePicAttr={profilePicAttr}
                superportsLength={superportsLength}
                pendingRequestsLength={pendingRequestsLength}
              />
            </Animated.View>
          );
        }}>
        <View
          style={{
            width: screen.width,
            height: isIOS ? screen.height : screen.height + insets.top,
          }}>
          <CustomStatusBar
            barStyle="dark-content"
            backgroundColor={PortColors.primary.white}
          />
          <SafeAreaView style={{backgroundColor: PortColors.background}}>
            <View
              style={[
                {
                  width: SIDE_DRAWER_WIDTH,
                  height: isIOS ? screen.height : screen.height + insets.top,
                  position: 'absolute',
                },
              ]}>
              <LinearGradient
                colors={[
                  'rgba(0, 0, 0, 0.05)',
                  'rgba(0, 0, 0, 0)',
                  'rgba(0, 0, 0, 0)',
                  'rgba(0, 0, 0, 0)',
                ]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={{width: '100%', height: '100%'}}
              />
            </View>
            <HomeTopbar
              openSwipeable={openSwipeable}
              showPrompt={showPrompt}
              searchText={searchText}
              setSearchText={setSearchText}
              unread={totalUnread}
              folder={selectedFolderData}
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
                {!searchReturnedNull ? (
                  <FlatList
                    data={viewableConnections}
                    renderItem={element => renderChatTile(element.item)}
                    style={styles.chats}
                    scrollEnabled={viewableConnections.length > 0}
                    contentContainerStyle={
                      viewableConnections.length > 0 && {
                        rowGap: PortSpacing.tertiary.uniform,
                      }
                    }
                    ListHeaderComponent={<View style={{height: 4}} />}
                    ListFooterComponent={
                      <View style={{height: PortSpacing.tertiary.bottom}} />
                    }
                    refreshing={refreshing}
                    onRefresh={async () => {
                      setRefreshing(true);
                      await debouncedPeriodicOperations();
                      await onRefresh();
                      setRefreshing(false);
                    }}
                    keyExtractor={connection => connection.chatId}
                    ListEmptyComponent={() =>
                      renderDefaultTile(
                        name,
                        profilePicAttr,
                        selectedFolderData,
                      )
                    }
                  />
                ) : (
                  <View style={{alignSelf: 'center', marginTop: 50}}>
                    <NumberlessText
                      textColor={PortColors.subtitle}
                      fontType={FontType.rg}
                      fontSizeType={FontSizeType.m}>
                      No results found
                    </NumberlessText>
                  </View>
                )}
              </View>
              {!selectionMode && (
                <GenericButton
                  onPress={() => {
                    setIsConnectionOptionsModalOpen(p => !p);
                  }}
                  iconSize={24}
                  IconLeft={BluePlusIcon}
                  buttonStyle={styles.addButtonWrapper}
                />
              )}
            </KeyboardAvoidingView>
            {/* go to component isolation playground */}
            {/* <GenericButton
              onPress={() => navigation.navigate('Isolation')}
              buttonStyle={styles.isolationButton}>
              🔑
            </GenericButton> */}
            <ConnectionOptions
              visible={isConnectionOptionsModalOpen}
              setVisible={setIsConnectionOptionsModalOpen}
              name={name}
              avatar={profilePicAttr}
            />
            <ErrorAddingContactBottomSheet
              visible={openFailedModal}
              title="Failed to add new contact"
              description="Looks like this Port has expired. Please use a valid Port to connect"
              onClose={() => {
                setSelectedProps(null);
                setOpenFailedModal(false);
              }}
            />
            <LoadingBottomSheet
              visible={openAddingNewContactModal}
              onClose={() => {
                setSelectedProps(null);
                setOpenAddingNewContactModal(false);
              }}
              title="Adding new contact..."
              onStopPress={async () => {
                if (selectedProps) {
                  await onStopAddingPress(selectedProps);
                } else if (selectedConnections[0]) {
                  await onStopAddingPress(selectedConnections[0]);
                }
              }}
            />
            <ConfirmationBottomSheet
              visible={confirmSheet}
              onClose={() => setConfirmSheet(false)}
              onConfirm={async () => {
                const chatHandler = new DirectChat(
                  selectedConnections[0].chatId,
                );
                await chatHandler.disconnect();
                setSelectedConnections([]);
                setSelectionMode(false);
                await onRefresh();
              }}
              title={'Are you sure you want to disconnect this chat?'}
              description={
                'Once you disconnect this chat, you cannot send messages to this contact. Chat history will be saved.'
              }
              buttonText={'Disconnect'}
              buttonColor="r"
            />
            <ConfirmationBottomSheet
              visible={confirmSheetDelete}
              onClose={() => setConfirmSheetDelete(false)}
              onConfirm={async () => {
                const chatHandler = new DirectChat(
                  selectedConnections[0].chatId,
                );
                await chatHandler.delete();
                setSelectedConnections([]);
                setSelectionMode(false);
                await onRefresh();
              }}
              title={'Are you sure you want to delete chat history?'}
              description={'Deleting history will erase all chat data'}
              buttonText={'Delete History'}
              buttonColor="r"
            />
            <MoveToFolder
              selectedConnections={selectedConnections}
              setSelectedConnections={setSelectedConnections}
              setSelectionMode={setSelectionMode}
              onRefresh={onRefresh}
              visible={moveToFolderSheet}
              onClose={() => setMoveToFolderSheet(false)}
              buttonText={'Move to folder'}
              buttonColor="b"
              currentFolder={selectedFolderData}
            />
            <ErrorSimpleBottomSheet
              visible={openLinkUseErrorModal}
              onClose={() => {
                setLinkUseError(0);
                setOpenLinkUseErrorModal(false);
              }}
              title={'Error using Port link'}
              description={getLinkUseErrorDescription()}
            />
            {selectionMode && (
              <ChatActionsBar
                selectedConnections={selectedConnections}
                openModal={openRightModal}
                openMoveToFolder={() => setMoveToFolderSheet(true)}
              />
            )}
          </SafeAreaView>
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  chats: {
    flex: 1,
  },
  isolationButton: {
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: PortSpacing.primary.bottom,
    left: PortSpacing.secondary.left,
    height: 56,
    width: 56,
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
