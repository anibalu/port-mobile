/**
 * The screen to a contact's profile and associated features
 */

import BackTopbar from '@components/BackTopBar';
import {
  NumberlessRegularText,
  NumberlessSemiBoldText,
} from '@components/NumberlessText';
import {default as React, useEffect, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, View} from 'react-native';

import DefaultImage from '@assets/avatars/avatar.png';
import Files from '@assets/icons/Files.svg';
import Gallery from '@assets/icons/Gallery.svg';
import GreyArrowRight from '@assets/icons/GreyArrowRight.svg';
import EditIcon from '@assets/icons/Pencil.svg';
import ChatBackground from '@components/ChatBackground';
import DeleteChatButton from '@components/DeleteChatButton';
import PermissionsDropdown from '@components/PermissionsDropdown/PermissionsDropdown';
import {SafeAreaView} from '@components/SafeAreaView';
import {DEFAULT_NAME} from '@configs/constants';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getConnection} from '@utils/Connections';
import DisconnectButton from './DisconnectButton';
import GenericModal from '@components/GenericModal';
import UpdateNamePopup from '@components/UpdateNamePopup';
import {screen} from '@components/ComponentUtils';

type Props = NativeStackScreenProps<AppStackParamList, 'ContactProfile'>;

function ContactProfile({route, navigation}: Props) {
  const {chatId} = route.params;

  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  const [name, setName] = useState(DEFAULT_NAME);
  const [updatedCounter, setUpdatedCounter] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    (async () => {
      const connection = await getConnection(chatId);
      setName(connection.name);
      if (connection.pathToDisplayPic) {
        setProfileURI(`file://${connection.pathToDisplayPic}`);
      }
      setConnected(!connection.disconnected);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedCounter]);

  function setUpdated(updated: boolean) {
    if (updated) {
      setUpdatedCounter(updatedCounter + 1);
    }
    setEditingName(false);
  }

  return (
    <SafeAreaView style={styles.profileScreen}>
      <ChatBackground />
      <BackTopbar />
      <ScrollView>
        <View style={styles.scrollContainer}>
          <View style={styles.profile}>
            <Pressable
              style={styles.profilePictureHitbox}
              onPress={() => {
                navigation.navigate('ImageView', {
                  imageURI: profileURI,
                  title: name,
                });
              }}>
              <Image source={{uri: profileURI}} style={styles.profilePic} />
            </Pressable>
            <View style={styles.nicknameArea}>
              <NumberlessSemiBoldText
                style={styles.nickname}
                ellipsizeMode="tail"
                numberOfLines={1}>
                {name}
              </NumberlessSemiBoldText>
              <View style={styles.nicknameEditBox}>
                <Pressable
                  style={styles.nicknameEditHitbox}
                  onPress={() => setEditingName(true)}>
                  <EditIcon />
                </Pressable>
              </View>
            </View>
          </View>
          <PermissionsDropdown bold={true} chatId={chatId} />
          <View style={styles.content}>
            <NumberlessSemiBoldText style={styles.contentTitle}>
              Content
            </NumberlessSemiBoldText>
            <Pressable
              style={styles.galleryButton}
              onPress={() => navigation.navigate('ViewPhotosVideos', {chatId})}>
              <Gallery />
              <NumberlessRegularText style={styles.galleryText}>
                Gallery
              </NumberlessRegularText>
              <GreyArrowRight />
            </Pressable>
            <Pressable
              style={styles.galleryButton}
              onPress={() => navigation.navigate('ViewFiles', {chatId})}>
              <Files />
              <NumberlessRegularText style={styles.galleryText}>
                Files
              </NumberlessRegularText>
              <GreyArrowRight />
            </Pressable>
          </View>
          {connected ? (
            <DisconnectButton chatId={chatId} />
          ) : (
            <DeleteChatButton chatId={chatId} stripMargin={true} />
          )}
        </View>
      </ScrollView>
      <GenericModal
        visible={editingName}
        onClose={() => {
          setUpdated(p => !p);
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
    width: screen.width,
    height: '100%',
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
    paddingLeft: 20,
    paddingRight: 20,
  },
  profilePictureHitbox: {
    width: 132,
    height: 132,
  },
  profilePic: {
    width: 132,
    height: 132,
    borderRadius: 44,
  },
  nicknameArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  nickname: {
    fontSize: 19,
    color: 'black',
    overflow: 'hidden',
    width: '60%',
    textAlign: 'center',
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
  nicknameEdit: {
    width: 24,
    height: 24,
  },
  empty: {
    width: 40,
    height: 40,
  },
  popUpArea: {
    backgroundColor: '#0005',
    width: '100%',
    height: '100%',
  },
  popupPosition: {
    position: 'absolute',
    bottom: 0,
  },
  content: {
    width: '90%',
    alignSelf: 'center',
  },
  contentTitle: {
    fontSize: 15,
    color: 'black',
    overflow: 'hidden',
    marginBottom: 10,
  },
  galleryText: {
    fontSize: 17,
    color: 'black',
    overflow: 'hidden',
    width: '75%',
    marginLeft: 20,
  },
  galleryButton: {
    width: '100%',
    height: 70,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default ContactProfile;
