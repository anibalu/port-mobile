/**
 * The screen to edit profile photo

 */
//import Camera from '@assets/icons/Camera.svg';
import ImageIcon from '@assets/icons/ImageIcon.svg';
import RemoveIcon from '@assets/icons/RemoveIcon.svg';
import Cross from '@assets/icons/cross.svg';

import ChatBackground from '@components/ChatBackground';
import {NumberlessMediumText} from '@components/NumberlessText';
import {SafeAreaView} from '@components/SafeAreaView';

import {GenericAvatar} from '@components/GenericAvatar';
import {avatarmapping} from '@configs/avatarmapping';
import {DEFAULT_AVATAR} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';
import {getProfilePictureUri, setNewProfilePicture} from '@utils/Profile';
import {FileAttributes} from '@utils/Storage/interfaces';
import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {SaveButton} from '@components/SaveButton';

function EditAvatar() {
  const navigation = useNavigation();
  // this is the profile uri
  const [imagePath, setImagePath] = useState(DEFAULT_AVATAR);
  const [profilePicAttr, setProfilePicAttr] = useState<FileAttributes>({
    fileUri: DEFAULT_AVATAR,
    fileName: '1',
    fileType: 'avatar',
  });
  //lets user set new profile picture
  async function setNewPicture() {
    try {
      const selectedAssets = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });
      // setting profile uri for display
      if (selectedAssets.assets && selectedAssets.assets[0]) {
        setImagePath(selectedAssets.assets[0].uri || DEFAULT_AVATAR);
        setProfilePicAttr({
          fileUri: selectedAssets.assets[0].uri || DEFAULT_AVATAR,
          fileName: selectedAssets.assets[0].fileName || '1',
          fileType: selectedAssets.assets[0].type || 'avatar',
        });
      }
    } catch (error) {
      console.log('Nothing selected', error);
    }
  }

  //updates profile picture with user set profile picture
  async function setPicture() {
    const uri = await getProfilePictureUri();
    if (uri && uri !== '') {
      console.log('URI is: ', uri);
      setImagePath(uri);
    }
  }

  useEffect(() => {
    (async () => {
      setPicture();
    })();
  }, []);

  async function onSavePicture() {
    await setNewProfilePicture(profilePicAttr);
    navigation.goBack();
  }
  async function onRemovePicture() {
    setImagePath(DEFAULT_AVATAR);
    setProfilePicAttr({
      fileUri: DEFAULT_AVATAR,
      fileName: '1',
      fileType: 'avatar',
    });
  }
  return (
    <SafeAreaView style={styles.profileScreen}>
      <ChatBackground />
      <View style={styles.profile}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeButton}>
          <Cross />
        </Pressable>
        <GenericAvatar profileUri={imagePath} avatarSize="medium" />
        <View style={styles.iconholder}>
          <Pressable onPress={setNewPicture} style={styles.selectOption}>
            <ImageIcon />
            <NumberlessMediumText style={styles.iconName}>
              Select Image
            </NumberlessMediumText>
          </Pressable>
          {imagePath !== DEFAULT_AVATAR && (
            <Pressable onPress={onRemovePicture} style={styles.selectOption}>
              <RemoveIcon />
              <NumberlessMediumText style={styles.iconName}>
                Remove
              </NumberlessMediumText>
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.avatarArea}>
        <NumberlessMediumText style={styles.chooseAvatarText}>
          Choose your avatar
        </NumberlessMediumText>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.avatarAccordion}>
          {avatarmapping.slice(0, 13).map(avatar => {
            const id = avatar.id;
            return (
              <View style={styles.avatarmap} key={id}>
                <GenericAvatar
                  profileUri={'avatar://' + id}
                  avatarSize="medium"
                  onPress={() => {
                    setImagePath('avatar://' + id);
                    setProfilePicAttr({
                      fileUri: 'avatar://' + id,
                      fileName: id,
                      fileType: 'avatar',
                    });
                  }}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
      <SaveButton onPress={onSavePicture} style={styles.button} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileScreen: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  profile: {
    width: '100%',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
  },
  profilePic: {
    width: 132,
    height: 132,
    borderRadius: 44,
    marginBottom: 10,
    marginRight: 10,
  },
  avatarmap: {
    marginLeft: 15,
  },
  iconholder: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 30,
    marginBottom: 20,
  },
  iconName: {
    color: 'black',
    fontSize: 12,
    marginTop: 10,
  },
  avatartext: {
    fontSize: 15,
  },
  avatarArea: {
    marginTop: 25,
  },
  avatar: {
    borderRadius: 40,
  },
  button: {
    width: '90%',
    position: 'absolute',
    bottom: 20,
  },
  closeButton: {
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  selectOption: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  chooseAvatarText: {
    marginLeft: 30,
  },
  avatarAccordion: {
    marginTop: 30,
  },
});

export default EditAvatar;
