/**
 * The screen to view one's own profile
 */

import React, {useEffect, useState} from 'react';
import {ImageBackground, Modal, Pressable, StatusBar, View} from 'react-native';
import {
  checkProfilePicture,
  readProfileNickname,
} from '../../utils/Profile';
import {Image, StyleSheet} from 'react-native';
import defaultImage from '../../../assets/avatars/avatar1.png';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import EditIcon from '../../../assets/icons/Pencil.svg';
import NicknamePopup from './UpdateNicknamePopup';
import {useNavigation} from '@react-navigation/native';
import { DEFAULT_NICKNAME } from '../../configs/constants';
import BackTopbar from '../../components/BackTopBar';
import { SafeAreaView } from '../../components/SafeAreaView';

function MyProfile() {
  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(defaultImage).uri,
  );
  const [nickname, setNickname] = useState(DEFAULT_NICKNAME);
  const [updatedCounter, setUpdatedCounter] = useState(0);
  const [editingNickname, setEditingNickname] = useState(false);

  useEffect(() => {
    (async () => {
      const profilePictureURI = await checkProfilePicture();
      setNickname(await readProfileNickname());
      if (profilePictureURI) {
        setProfileURI(profilePictureURI);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedCounter]);

  function setUpdated(updated: boolean) {
    if (updated) {
      setUpdatedCounter(updatedCounter + 1);
    }
    setEditingNickname(false);
  }

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.profileScreen}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ImageBackground
        source={require('../../../assets/backgrounds/puzzle.png')}
        style={styles.background}
      />
      <BackTopbar/>
      <View style={styles.profile}>
        <Pressable
          style={styles.profilePictureHitbox}
          onPress={() => {
            navigation.navigate('ImageView', {
              imageURI: profileURI,
              title: nickname,
            });
          }}>
          <Image source={{ uri: profileURI }} style={styles.profilePic} />
        </Pressable>
        <View style={styles.nicknameArea}>
          <NumberlessSemiBoldText
            style={styles.nickname}
            ellipsizeMode="tail"
            numberOfLines={1}>
            {nickname}
          </NumberlessSemiBoldText>
          <View style={styles.nicknameEditBox}>
            <Pressable
              style={styles.nicknameEditHitbox}
              onPress={() => setEditingNickname(true)}>
              <EditIcon />
            </Pressable>
          </View>
        </View>
      </View>
      <Modal animationType="none" visible={editingNickname} transparent={true}>
        <Pressable style={styles.popUpArea} onPress={() => setUpdated(false)}>
          <Pressable style={styles.popupPosition}>
            <NicknamePopup
              setUpdated={setUpdated}
              initialNickname={nickname}
            />
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
    width: 132,
    height: 132,
  },
  profilePic: {
    width: 132,
    height: 132,
    borderRadius: 24,
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
});


export default MyProfile;
