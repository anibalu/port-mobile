/**
 * The screen to view one's own profile
 */

import React, {useEffect, useState} from 'react';
import {Modal, Pressable, View} from 'react-native';
import {
  getProfilePictureURI,
  readProfileNickname,
  setNewProfilePicture,
} from '../../utils/Profile';
import {Image, StyleSheet} from 'react-native';
import defaultImage from '../../../assets/avatars/avatar1.png';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import EditIcon from '../../../assets/icons/Pencil.svg';
import NicknamePopup from './UpdateNicknamePopup';

function MyProfile() {
  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(defaultImage).uri,
  );
  const [nickname, setNickname] = useState('Nickname');
  const [updatedCounter, setUpdatedCounter] = useState(0);
  const [editingNickname, setEditingNickname] = useState(false);

  useEffect(() => {
    (async () => {
      setProfileURI(await getProfilePictureURI());
      setNickname(await readProfileNickname());
    })();
  }, [updatedCounter]);

  function setUpdated(updated: boolean) {
    if (updated) {
      setUpdatedCounter(updatedCounter + 1);
    }
    setEditingNickname(false);
  }

  return (
    <View style={styles.profileScreen}>
      <View style={styles.profile}>
        <Pressable
          style={styles.profilePictureHitbox}
          onPress={() => setNewProfilePicture()}>
          <Image source={{uri: profileURI}} style={styles.profilePic} />
        </Pressable>
        <View style={styles.nicknameArea}>
          <View style={styles.empty} />
          <NumberlessSemiBoldText style={styles.nickname}>
            {nickname}
          </NumberlessSemiBoldText>
          <Pressable
            style={styles.nicknameEditHitbox}
            onPress={() => setEditingNickname(true)}>
            <EditIcon />
          </Pressable>
        </View>
      </View>
      <Modal animationType="slide" visible={editingNickname} transparent={true}>
        <Pressable style={styles.popUpArea} onPress={() => setUpdated(false)}>
          <Pressable style={styles.popupPosition}>
            <NicknamePopup setUpdated={setUpdated} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  profileScreen: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  profile: {
    width: '100%',
    height: 230,
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
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
    height: 40,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nickname: {
    fontSize: 19,
    color: 'black',
    overflow: 'hidden',
  },
  nicknameEditHitbox: {
    width: 40,
    height: 40,
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
