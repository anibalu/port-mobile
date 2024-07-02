import {AppStackParamList} from '@navigation/AppStackTypes';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  NativeSyntheticEvent,
  ScrollViewProps,
} from 'react-native';
import {SafeAreaView} from '@components/SafeAreaView';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {PortSpacing, screen} from '@components/ComponentUtils';
import EditIcon from '@assets/icons/PencilCircleAccent.svg';
import Alert from '@assets/icons/Alert.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import ChatSettingsCard from '../../components/Reusable/PermissionCards/ChatSettingsCard';
import AdvanceSettingsCard from '../../components/Reusable/PermissionCards/AdvanceSettingsCard';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import SharedMediaCard from './SharedMediaCard';
import {useFocusEffect} from '@react-navigation/native';
import {getImagesAndVideos} from '@utils/Storage/media';
import {MediaEntry} from '@utils/Media/interfaces';
import DirectChat from '@utils/DirectChats/DirectChat';
import EditName from '@components/Reusable/BottomSheets/EditName';
import {
  defaultFolderInfo,
  defaultPermissions,
  safeModalCloseDuration,
} from '@configs/constants';
import {PermissionsStrict} from '@utils/ChatPermissions/interfaces';

import UserInfoTopbar from '@components/Reusable/TopBars/UserInfoTopbar';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import AddFolderBottomsheet from '@components/Reusable/BottomSheets/AddFolderBottomsheet';
import {FolderInfo} from '@utils/ChatFolders/interfaces';
import {getAllFolders} from '@utils/ChatFolders';
import {getConnection} from '@utils/Connections';
import ConfirmationBottomSheet from '@components/Reusable/BottomSheets/ConfirmationBottomSheet';
import * as storage from '@utils/UserBlocking';
import SecondaryButton from '@components/Reusable/LongButtons/SecondaryButton';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {wait} from '@utils/Time';
import {useTheme} from 'src/context/ThemeContext';
import ProfilePictureBlurViewModal from '@components/Reusable/BlurView/ProfilePictureBlurView';

type Props = NativeStackScreenProps<AppStackParamList, 'ContactProfile'>;

const ContactProfile = ({route, navigation}: Props) => {
  const {chatId, name, profileUri, permissionsId, isConnected} = route.params;
  const [media, setMedia] = useState<MediaEntry[]>([]);
  const [showUserInfoInTopbar, setShowUserInfoInTopbar] = useState(false);
  const userAvatarViewRef = useRef<View>(null);
  const [displayName, setDisplayName] = useState<string>(name);
  const [displayPic, setDisplayPic] = useState<string>(profileUri);
  const [showAddFolderModal, setShowAddFolderModal] = useState<boolean>(false);

  const [editingName, setEditingName] = useState(false);
  const [confirmSheet, setConfirmSheet] = useState(false);
  const [confirmSheetDelete, setConfirmSheetDelete] = useState(false);
  const [confirmBlockUserSheet, setConfirmBlockUserSheet] = useState(false);
  const [pairHash, setPairHash] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const [connected, setConnected] = useState(isConnected);
  const [focusProfilePicture, setFocusProfilePicture] =
    useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderInfo>({
    ...defaultFolderInfo,
  });
  //set permissions
  const [permissions, setPermissions] = useState<PermissionsStrict>({
    ...defaultPermissions,
  });

  const Colors = DynamicColors();
  const styles = styling(Colors);

  const svgArray = [
    // 1.NotificationOutline
    {
      assetName: 'RightChevron',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const {DisconnectChatError} = useErrorModal();

  const RightChevron = results.RightChevron;

  const loadMedia = async () => {
    const response = await getImagesAndVideos(chatId);
    setMedia(response);
  };

  useFocusEffect(
    useCallback(() => {
      (() => {
        loadMedia();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  useEffect(() => {
    (async () => {
      try {
        const chatHandler = new DirectChat(chatId);
        const chatData = await chatHandler.getChatData();
        if (chatData.pairHash) {
          setPairHash(chatData.pairHash);
        }

        const connection = await getConnection(chatId);

        const folders = await getAllFolders();
        const folder = folders.find(f => f.folderId === connection.folderId);
        if (folder) {
          setSelectedFolder(folder);
        }
        setDisplayName(chatData.name);
        if (chatData.displayPic) {
          setDisplayPic(chatData.displayPic);
        }
        setConnected(!chatData.disconnected);
      } catch (error) {
        console.log('Error running initial effect', error);
      }
    })();
  }, [chatId]);

  useMemo(() => {
    if (pairHash) {
      (async () => {
        const userBlocked = await storage.isUserBlocked(pairHash);
        setIsBlocked(userBlocked);
      })();
    }
  }, [pairHash]);

  const onSaveName = async () => {
    const chatHandler = new DirectChat(chatId);
    await chatHandler.updateName(displayName);
    setEditingName(false);
  };
  useMemo(() => {
    onSaveName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayName]);

  const handleScroll = (event: NativeSyntheticEvent<ScrollViewProps>) => {
    const {contentOffset} = event.nativeEvent;
    if (contentOffset) {
      const {y} = contentOffset;
      if (y >= 120) {
        setShowUserInfoInTopbar(true);
      } else {
        setShowUserInfoInTopbar(false);
      }
    }
  };

  const blockUser = async () => {
    try {
      await storage.blockUser({
        name: name,
        pairHash: pairHash,
        time: new Date().toISOString(),
      });
      setIsBlocked(true);
    } catch {
      console.log('Error in blocking user');
    }
  };

  const unblockUser = async () => {
    try {
      await storage.unblockUser(pairHash);
      setIsBlocked(false);
    } catch {
      console.log('Error in unblocking user');
    }
  };

  const handleChatDisconnect = async (
    chatIdString: string,
    selectedFolderInfo: FolderInfo,
  ) => {
    try {
      const chatHandler = new DirectChat(chatIdString);
      await chatHandler.disconnect();
      navigation.navigate('HomeTab', {
        selectedFolder: {...selectedFolderInfo},
      });
    } catch (error) {
      console.error(
        'Error disconnecting chat. Please check your network connection',
        error,
      );
      await wait(safeModalCloseDuration);
      DisconnectChatError();
    }
  };
  const {themeValue} = useTheme();

  const onProfilePictureClick = () => {
    setFocusProfilePicture(true);
  };

  return (
    <>
      <CustomStatusBar
        backgroundColor={
          showUserInfoInTopbar
            ? Colors.primary.surface
            : Colors.primary.background
        }
      />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <UserInfoTopbar
          backgroundColor={showUserInfoInTopbar ? 'w' : 'g'}
          heading={displayName}
          avatarUri={displayPic}
          showUserInfo={showUserInfoInTopbar}
        />
        <View style={styles.mainContainer}>
          <ScrollView
            contentContainerStyle={{height: connected ? 'auto' : '100%'}}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            <View style={styles.avatarContainer} ref={userAvatarViewRef}>
              <AvatarBox
                onPress={() => onProfilePictureClick()}
                profileUri={displayPic}
                avatarSize="m"
              />

              <Pressable
                style={styles.nameEditHitbox}
                onPress={() => setEditingName(true)}>
                <NumberlessText
                  style={{
                    maxWidth:
                      screen.width - 2 * PortSpacing.secondary.uniform - 30,
                    marginRight: 4,
                  }}
                  textColor={Colors.labels.text}
                  fontSizeType={FontSizeType.xl}
                  fontType={FontType.sb}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {displayName}
                </NumberlessText>
                <EditIcon height={20} width={20} />
              </Pressable>
            </View>
            <View style={styles.sharedMediaContainer}>
              <SharedMediaCard media={media} chatId={chatId} />
            </View>
            {connected ? (
              <>
                <View style={styles.chatSettingsContainer}>
                  <SimpleCard style={styles.folderCard}>
                    <Pressable
                      style={styles.clickableCard}
                      onPress={() => setShowAddFolderModal(true)}>
                      <View style={styles.cardTitle}>
                        <NumberlessText
                          textColor={Colors.labels.text}
                          fontSizeType={FontSizeType.l}
                          fontType={FontType.md}>
                          Chat folder
                        </NumberlessText>
                      </View>
                      <View style={styles.labelContainer}>
                        <View style={styles.labelWrapper}>
                          <NumberlessText
                            textColor={
                              selectedFolder.name === defaultFolderInfo.name
                                ? Colors.labels.text
                                : themeValue === 'light'
                                ? Colors.primary.accent
                                : Colors.primary.white
                            }
                            fontSizeType={FontSizeType.m}
                            fontType={FontType.rg}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {selectedFolder.name}
                          </NumberlessText>
                        </View>
                        <RightChevron width={20} height={20} />
                      </View>
                    </Pressable>
                  </SimpleCard>
                </View>
                <View style={styles.chatSettingsContainer}>
                  <ChatSettingsCard
                    chatId={chatId}
                    permissionsId={permissionsId}
                    permissions={permissions}
                    setPermissions={setPermissions}
                  />
                </View>
                <View style={styles.advanceSettingsContainer}>
                  <AdvanceSettingsCard
                    permissionsId={permissionsId}
                    permissions={permissions}
                    setPermissions={setPermissions}
                  />
                </View>
                <View style={{paddingBottom: PortSpacing.secondary.bottom}}>
                  <NumberlessText
                    style={{
                      color: Colors.primary.red,
                      marginTop: PortSpacing.secondary.top,
                    }}
                    fontSizeType={FontSizeType.l}
                    fontType={FontType.md}>
                    Disconnect chat?
                  </NumberlessText>
                  <NumberlessText
                    style={styles.footerDesc}
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.rg}>
                    When a chat is disconnected, you can't contact the user
                    until you connect again using a new Port.
                  </NumberlessText>

                  <PrimaryButton
                    isLoading={false}
                    disabled={false}
                    primaryButtonColor="r"
                    buttonText="Disconnect"
                    onClick={() => {
                      setConfirmSheet(true);
                    }}
                  />
                </View>
              </>
            ) : (
              <View style={styles.disconnectedwrapper}>
                <View style={styles.alertwrapper}>
                  <Alert style={{alignSelf: 'center'}} />
                  <NumberlessText
                    style={{
                      alignSelf: 'center',
                      textAlign: 'center',
                      width: '100%',
                      marginTop: PortSpacing.secondary.top,
                    }}
                    textColor={Colors.text.subtitle}
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.rg}>
                    Your chat has been disconnected. Deleting history will erase
                    all chat data and remove this contact from your home screen.
                  </NumberlessText>
                </View>
                <View style={{gap: 10}}>
                  <PrimaryButton
                    isLoading={false}
                    disabled={false}
                    primaryButtonColor="r"
                    buttonText="Delete history"
                    onClick={() => {
                      setConfirmSheetDelete(true);
                    }}
                  />
                  <SecondaryButton
                    secondaryButtonColor="r"
                    buttonText={isBlocked ? 'Unblock contact' : 'Block contact'}
                    onClick={() => setConfirmBlockUserSheet(true)}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
        <AddFolderBottomsheet
          chatId={chatId}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
          setVisible={setShowAddFolderModal}
          visible={showAddFolderModal}
        />
        <EditName
          visible={editingName}
          onClose={() => setEditingName(false)}
          name={displayName}
          setName={setDisplayName}
          title="Update this contact's name"
        />
        <ConfirmationBottomSheet
          visible={confirmSheet}
          onClose={() => setConfirmSheet(false)}
          onConfirm={async () =>
            await handleChatDisconnect(chatId, selectedFolder)
          }
          title={'Are you sure you want to disconnect this chat?'}
          description={
            'Disconnecting a chat will prevent further messaging. Current chat history will be saved, but you can subsequently choose to delete it.'
          }
          buttonText={'Disconnect'}
          buttonColor="r"
        />
        <ConfirmationBottomSheet
          visible={confirmSheetDelete}
          onClose={() => setConfirmSheetDelete(false)}
          onConfirm={async () => {
            const chatHandler = new DirectChat(chatId);
            await chatHandler.delete();
            navigation.navigate('HomeTab', {
              selectedFolder: {...selectedFolder},
            });
          }}
          title={'Are you sure you want to delete chat history?'}
          description={'Deleting history will erase all chat data'}
          buttonText={'Delete history'}
          buttonColor="r"
        />
        <ConfirmationBottomSheet
          visible={confirmBlockUserSheet}
          onClose={() => setConfirmBlockUserSheet(false)}
          onConfirm={async () => {
            isBlocked ? await unblockUser() : await blockUser();
          }}
          title={
            isBlocked
              ? `Are you sure you want to unblock ${name}?`
              : `Are you sure you want to block ${name}?`
          }
          description={
            isBlocked
              ? `After you unblock ${name}, you may connect with them over Ports or Superports.`
              : `Blocking ${name} will prevent them from connecting with you over Ports, Superports or contact sharing until you unblock them.`
          }
          buttonText={isBlocked ? 'Unblock contact' : 'Block contact'}
          buttonColor="r"
        />
        {focusProfilePicture && (
          <ProfilePictureBlurViewModal
            avatarUrl={displayPic}
            onClose={() => setFocusProfilePicture(false)}
          />
        )}
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    mainContainer: {
      padding: PortSpacing.secondary.uniform,
      paddingTop: 0,
      paddingBottom: 0,
      flex: 1,
    },
    labelContainer: {
      flexDirection: 'row',
      gap: 4,
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: 1,
    },
    cardTitle: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginRight: 24,
    },
    disconnectedwrapper: {
      flexDirection: 'column',
      justifyContent: 'center',
      height: '100%',
      flex: 1,
    },
    labelWrapper: {
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 4,
      backgroundColor: colors.primary.lightgrey,
    },
    folderCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.secondary.uniform,
    },
    nameEditHitbox: {
      marginTop: PortSpacing.secondary.top,
      flexDirection: 'row',
      alignItems: 'center',
    },
    sharedMediaContainer: {
      marginBottom: PortSpacing.secondary.bottom,
    },
    alertwrapper: {flex: 1, justifyContent: 'center'},
    chatSettingsContainer: {
      marginBottom: PortSpacing.secondary.bottom,
    },
    clickableCard: {
      flexDirection: 'row',
      gap: 5,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footerDesc: {
      color: colors.labels.text,
      lineHeight: 16,
      marginTop: PortSpacing.tertiary.top,
      marginBottom: PortSpacing.intermediate.bottom,
    },
    advanceSettingsContainer: {
      marginBottom: PortSpacing.secondary.bottom,
    },
    avatarContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: PortSpacing.primary.bottom,
    },
  });

export default ContactProfile;
