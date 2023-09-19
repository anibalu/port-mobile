/**
 * The screen to a contact's profile and associated features
 */

import React, {useEffect, useState} from 'react';
import {ImageBackground, Modal, Pressable, StatusBar, View} from 'react-native';
import {Image, StyleSheet} from 'react-native';
import {NumberlessSemiBoldText} from '../../components/NumberlessText';
import NicknamePopup from './UpdateNicknamePopup';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getConnection} from '../../utils/Connection';
import BackTopbar from '../../components/BackTopBar';

import defaultImage from '../../../assets/avatars/avatar1.png';
import EditIcon from '../../../assets/icons/Pencil.svg';
import PermissionsDropdown from '../../components/PermissionsDropdown/PermissionsDropdown';
import {DEFAULT_NICKNAME} from '../../configs/constants';
import {SafeAreaView} from '../../components/SafeAreaView';

function ContactProfile() {
  const route = useRoute();
  const {lineId} = route.params;

  const [profileURI, setProfileURI] = useState(
    Image.resolveAssetSource(defaultImage).uri,
  );
  const [nickname, setNickname] = useState(DEFAULT_NICKNAME);
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
      <BackTopbar />
      <View style={styles.profile}>
        <Pressable
          style={styles.profilePictureHitbox}
          onPress={() => {
            navigation.navigate('ImageView', {
              imageURI: profileURI,
              title: nickname,
            });
          }}>
          <Image source={{uri: profileURI}} style={styles.profilePic} />
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
      <PermissionsDropdown lineId={lineId} />
      <Modal animationType="none" visible={editingNickname} transparent={true}>
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
});

export default ContactProfile;
