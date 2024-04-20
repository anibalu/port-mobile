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
import RightChevron from '@assets/icons/BlackAngleRight.svg';
import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import EditIcon from '@assets/icons/BluePencilCircle.svg';
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
import {defaultFolderInfo, defaultPermissions} from '@configs/constants';
import {PermissionsStrict} from '@utils/ChatPermissions/interfaces';

import UserInfoTopbar from '@components/Reusable/TopBars/UserInfoTopbar';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';
import AddFolderBottomsheet from '@components/Reusable/BottomSheets/AddFolderBottomsheet';
import {FolderInfo} from '@utils/ChatFolders/interfaces';
import {getAllFolders} from '@utils/ChatFolders';
import {getConnection} from '@utils/Connections';
import ConfirmationBottomSheet from '@components/Reusable/BottomSheets/ConfirmationBottomSheet';

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

  const [connected, setConnected] = useState(isConnected);
  const [selectedFolder, setSelectedFolder] = useState<FolderInfo>({
    ...defaultFolderInfo,
  });
  //set permissions
  const [permissions, setPermissions] = useState<PermissionsStrict>({
    ...defaultPermissions,
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={
          showUserInfoInTopbar
            ? PortColors.primary.white
            : PortColors.background
        }
      />
      <SafeAreaView style={{backgroundColor: PortColors.background}}>
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
              <AvatarBox profileUri={displayPic} avatarSize="m" />
              <Pressable
                style={styles.nameEditHitbox}
                onPress={() => setEditingName(true)}>
                <NumberlessText
                  style={{
                    maxWidth:
                      screen.width - 2 * PortSpacing.secondary.uniform - 30,
                  }}
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
                                ? PortColors.subtitle
                                : PortColors.primary.blue.app
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
                <View>
                  <NumberlessText
                    style={{
                      color: PortColors.primary.red.error,
                      marginTop: PortSpacing.secondary.top,
                    }}
                    fontSizeType={FontSizeType.l}
                    fontType={FontType.md}>
                    Disconnect Port?
                  </NumberlessText>
                  <NumberlessText
                    style={styles.footerDesc}
                    fontSizeType={FontSizeType.s}
                    fontType={FontType.rg}>
                    When a port is disconnected, you can't contact the user
                    until you both open a new port using a QR code or link.
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
                    fontSizeType={FontSizeType.m}
                    fontType={FontType.rg}>
                    Your chat has been disconnected. Deleting history will erase
                    all chat data.
                  </NumberlessText>
                </View>
                <View>
                  <PrimaryButton
                    isLoading={false}
                    disabled={false}
                    primaryButtonColor="r"
                    buttonText="Delete history"
                    onClick={() => {
                      setConfirmSheetDelete(true);
                    }}
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
          onConfirm={async () => {
            const chatHandler = new DirectChat(chatId);
            await chatHandler.disconnect();
            navigation.navigate('HomeTab', {
              selectedFolder: {...selectedFolder},
            });
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
            const chatHandler = new DirectChat(chatId);
            await chatHandler.delete();
            navigation.navigate('HomeTab', {
              selectedFolder: {...selectedFolder},
            });
          }}
          title={'Are you sure you want to delete chat history?'}
          description={'Deleting history will erase all chat data'}
          buttonText={'Delete History'}
          buttonColor="r"
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    padding: PortSpacing.secondary.uniform,
    paddingTop: 0,
    backgroundColor: PortColors.background,
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
    backgroundColor: PortColors.background,
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
    color: PortColors.subtitle,
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
