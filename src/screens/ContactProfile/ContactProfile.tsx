/**
 * The screen to a contact's profile and associated features
 */

import React, {useEffect, useState} from 'react';
import {Modal, Pressable, View} from 'react-native';
import {Image, StyleSheet} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import NicknamePopup from './UpdateNicknamePopup';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getConnection} from '../../utils/Connection';

import defaultImage from '../../../assets/avatars/avatar1.png';
import EditIcon from '../../../assets/icons/Pencil.svg';
import BackButton from '../../../assets/navigation/backButton.svg';

function MyProfile() {
  const route = useRoute();
  const {lineId} = route.params;

  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(defaultImage).uri,
  );
  const [nickname, setNickname] = useState('');
  const [updatedCounter, setUpdatedCounter] = useState(0);
  const [editingNickname, setEditingNickname] = useState(false);

  useEffect(() => {
    (async () => {
      const connection = await getConnection(lineId);
      setNickname(connection.nickname);
      if (connection.pathToImage) {
        setProfileURI(`file://${connection.pathToImage}`);
      }
    })();
  }, [updatedCounter]);

  function setUpdated(updated: boolean) {
    if (updated) {
      setUpdatedCounter(updatedCounter + 1);
    }
    setEditingNickname(false);
  }

  const navigation = useNavigation();

  return (
    <View style={styles.profileScreen}>
      <View style={styles.profile}>
        <View style={styles.topbar}>
          <Pressable
            style={styles.backHitbox}
            onPress={() => navigation.goBack()}>
            <BackButton />
          </Pressable>
        </View>
        <Image source={{uri: profileURI}} style={styles.profilePic} />
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
            <NicknamePopup
              setUpdated={setUpdated}
              initialNickname={nickname}
              lineId={lineId}
            />
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
  topbar: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  backHitbox: {
    width: 30,
    height: 30,
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
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
  popupPosition: {
    position: 'absolute',
    bottom: 0,
  },
});

export default MyProfile;
