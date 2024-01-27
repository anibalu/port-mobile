/**
 * The screen to a contact's profile and associated features
 */

import EditIcon from '@assets/icons/Pencil.svg';
import Play from '@assets/icons/videoPlay.svg';
import ChatBackground from '@components/ChatBackground';
import {PortColors, screen} from '@components/ComponentUtils';
import DeleteChatButton from '@components/DeleteChatButton';
import {GenericAvatar} from '@components/GenericAvatar';
import {GenericButton} from '@components/GenericButton';
import GenericModal from '@components/GenericModal';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DirectChatPermissionDropdown from '@components/PermissionsDropdown/DirectChatPermissionDropdown';
import {SafeAreaView} from '@components/SafeAreaView';
import UpdateNamePopup from '@components/UpdateNamePopup';
import {DEFAULT_NAME} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';

import GenericTopBar from '@components/GenericTopBar';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import DirectChat from '@utils/DirectChats/DirectChat';
import {MediaEntry} from '@utils/Media/interfaces';
import {ContentType} from '@utils/Messaging/interfaces';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {getImagesAndVideos} from '@utils/Storage/media';
import {default as React, useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import DisconnectButton from './DisconnectButton';

type Props = NativeStackScreenProps<AppStackParamList, 'ContactProfile'>;

function ContactProfile({route, navigation}: Props) {
  const {chatId} = route.params;

  const chatHandler = new DirectChat(chatId);
  const [profileURI, setProfileURI] = useState<string>();
  const [name, setName] = useState(DEFAULT_NAME);
  const [updatedCounter, setUpdatedCounter] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    (async () => {
      const chat = new DirectChat(chatId);
      const chatData = await chat.getChatData();

      setName(chatData.name);
      if (chatData.displayPic) {
        setProfileURI(chatData.displayPic);
      }
      setConnected(!chatData.disconnected);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedCounter]);

  function setUpdated(updated: boolean) {
    if (updated) {
      setUpdatedCounter(updatedCounter + 1);
    }
    setEditingName(false);
  }
  const [media, setMedia] = useState<MediaEntry[]>([]);

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

  const renderSelectedPhoto = ({item}: {item: MediaEntry}) => {
    return (
      <Pressable
        key={item.mediaId}
        onPress={() => {
          FileViewer.open(getSafeAbsoluteURI(item.filePath, 'doc'), {
            showOpenWithDialog: true,
          });
        }}>
        <>
          <Image
            source={{
              uri:
                item.type === ContentType.video && item.previewPath != undefined
                  ? getSafeAbsoluteURI(item.previewPath, 'cache')
                  : getSafeAbsoluteURI(item.filePath, 'doc'),
            }}
            style={styles.image}
          />
          {item.type === ContentType.video && (
            <Play
              style={{
                position: 'absolute',
                top: 0.25 * screen.width - 55,
                left: 0.25 * screen.width - 55,
              }}
            />
          )}
        </>
      </Pressable>
    );
  };

  const onDelete = async () => {
    await chatHandler.delete();
    navigation.navigate('HomeTab');
  };

  return (
    <SafeAreaView style={styles.profileScreen}>
      <ChatBackground />
      <GenericTopBar
        title={'Contact profile'}
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      <ScrollView>
        <View style={styles.scrollContainer}>
          <View style={styles.profile}>
            <GenericAvatar profileUri={profileURI} avatarSize={'medium'} />
            <View style={styles.nicknameArea}>
              <NumberlessText
                fontSizeType={FontSizeType.xl}
                fontType={FontType.sb}
                numberOfLines={1}
                style={{maxWidth: '80%'}}
                ellipsizeMode="tail">
                {name}
              </NumberlessText>
              <View style={styles.nicknameEditBox}>
                <Pressable
                  style={styles.nicknameEditHitbox}
                  onPress={() => setEditingName(true)}>
                  <EditIcon />
                </Pressable>
              </View>
            </View>
          </View>
          {connected && (
            <DirectChatPermissionDropdown bold={true} chatId={chatId} />
          )}
          <View style={styles.content}>
            <View style={styles.mediaView}>
              <NumberlessText
                fontSizeType={FontSizeType.m}
                fontType={FontType.md}>
                Shared media
              </NumberlessText>
              {media.length > 0 && (
                <GenericButton
                  onPress={() =>
                    navigation.navigate('SharedMedia', {chatId: chatId})
                  }
                  textStyle={styles.seealltext}
                  buttonStyle={styles.seeall}>
                  See all
                </GenericButton>
              )}
            </View>

            {media.length > 0 ? (
              <FlatList
                contentContainerStyle={{marginTop: 12}}
                data={media.slice(0, 10)}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={true}
                horizontal={true}
                renderItem={renderSelectedPhoto}
              />
            ) : (
              <View
                style={{
                  borderRadius: 8,
                  width: 150,
                  borderWidth: 1,
                  borderColor: '#DBDBDB',
                  alignSelf: 'center',
                  marginTop: 20,
                }}>
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.md}
                  textColor="#555555"
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    textAlign: 'center',
                  }}>
                  No shared media
                </NumberlessText>
              </View>
            )}
          </View>
          <View style={{marginTop: 20, width: '100%'}}>
            {connected ? (
              <DisconnectButton chatId={chatId} />
            ) : (
              <View style={styles.deleteHistoryContainer}>
                <DeleteChatButton onDelete={onDelete} />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <GenericModal
        visible={editingName}
        onClose={() => {
          setUpdated(false);
        }}>
        <UpdateNamePopup
          setUpdated={setUpdated}
          initialName={name}
          chatId={chatId}
        />
      </GenericModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileScreen: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scrollContainer: {
    alignItems: 'center',
  },
  profile: {
    width: screen.width,
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  mediaView: {
    flexDirection: 'row',
    marginTop: 15,
  },
  nicknameArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  deleteHistoryContainer: {
    alignSelf: 'center',
    width: '100%',
  },
  nicknameEditBox: {
    width: '100%',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  nicknameEditHitbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingBottom: 20,
    paddingLeft: 20,
    width: '100%',
    flex: 1,
  },

  blackimage: {
    width: (screen.width - 30) / 3,
    height: (screen.width - 30) / 3,
    margin: 5,
    borderRadius: 24,
    backgroundColor: 'black',
  },
  image: {
    width: (screen.width - 30) / 3,
    height: (screen.width - 30) / 3,
    margin: 5,
    borderRadius: 24,
  },
  seeall: {
    backgroundColor: 'white',
    position: 'absolute',
    right: 0,
    top: -10,
  },
  seealltext: {
    color: PortColors.text.secondary,
    fontSize: FontSizeType.s,
    fontWeight: '500',
  },
});

export default ContactProfile;
