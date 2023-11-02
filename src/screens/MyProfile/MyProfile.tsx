/**
 * The screen to view one's own profile
 * screen Id: 8
 */
import React, {useEffect, useState} from 'react';
import {ImageBackground, Modal, Pressable, StatusBar, View} from 'react-native';
import {Image, StyleSheet} from 'react-native';
import DefaultImage from '../../../assets/avatars/avatar.png';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import EditIcon from '../../../assets/icons/Pencil.svg';
import EditCameraIcon from '../../../assets/icons/EditCamera.svg';
import NamePopup from './UpdateNamePopup';
import {useNavigation} from '@react-navigation/native';
import {DEFAULT_NAME} from '../../configs/constants';
import BackTopbar from '../../components/BackTopBar';
import {SafeAreaView} from '../../components/SafeAreaView';
import {
  getProfileName,
  getProfilePicture,
  setNewProfilePicture,
} from '../../utils/Profile';
import {Asset, launchImageLibrary} from 'react-native-image-picker';

function MyProfile() {
  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  const [name, setName] = useState(DEFAULT_NAME);
  const [updatedCounter, setUpdatedCounter] = useState(0);
  const [editingName, setEditingName] = useState(false);

  //updates profile picture with user set profile picture
  async function setPicture() {
    const uri = await getProfilePicture();
    if (uri && uri !== '') {
      setProfileURI(uri);
    }
  }
  //lets user set new profile picture
  async function setNewPicture() {
    try {
      const selectedAssets = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        selectionLimit: 1,
      });
      //images are selected
      const selected: Asset[] = selectedAssets.assets || [];
      if (selected.length >= 1) {
        await setNewProfilePicture({
          fileUri: selected[0].uri || '',
          fileType: selected[0].type || '',
          fileName: selected[0].fileName || '',
        });
        await setPicture();
      }
    } catch (error) {
      console.log('Nothing selected', error);
    }
  }
  //updates name with user set name
  async function setUserName() {
    setName(await getProfileName());
  }

  useEffect(() => {
    (async () => {
      setPicture();
      setUserName();
    })();
  }, [updatedCounter]);

  function setUpdated(updated: boolean) {
    if (updated) {
      setUpdatedCounter(updatedCounter + 1);
    }
    setEditingName(false);
  }

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.profileScreen}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      />
      <BackTopbar />
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
          <Pressable
            style={styles.updatePicture}
            onPress={() => {
              setNewPicture();
            }}>
            <EditCameraIcon />
          </Pressable>
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
      <Modal animationType="none" visible={editingName} transparent={true}>
        <Pressable style={styles.popUpArea} onPress={() => setUpdated(false)}>
          <Pressable style={styles.popupPosition}>
            <NamePopup setUpdated={setUpdated} initialName={name} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileScreen: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
    backgroundColor: '#F9F9F9',
    opacity: 0.5,
    overflow: 'hidden',
  },
  profile: {
    width: '100%',
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
    width: 152,
    height: 152,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  profilePic: {
    width: 132,
    height: 132,
    borderRadius: 44,
    marginBottom: 10,
    marginRight: 10,
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
  updatePicture: {
    width: 40,
    height: 40,
    backgroundColor: '#547CEF',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default MyProfile;
