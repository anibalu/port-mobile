/**
 * @deprecated
 */
import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import Delete from '@assets/icons/TrashcanWhite.svg';
import GalleryOutline from '@assets/icons/GalleryOutline.svg';
import {PortColors, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {GenericAvatar} from '@components/GenericAvatar';
import {DEFAULT_AVATAR} from '@configs/constants';
import {launchImageLibrary} from 'react-native-image-picker';
import {FileAttributes} from '@utils/Storage/interfaces';
import {DirectAvatarMapping} from '@configs/avatarmapping';
import {getProfilePictureUri} from '@utils/Profile';

interface EditAvatarProps {
  setLocalImagePath?: any;
  localImagePath?: any;
  onSave?: any;
}

export default function EditAvatar(props: EditAvatarProps) {
  const {onSave, setLocalImagePath, localImagePath} = props;

  const [imagePath, setImagePath] = useState(DEFAULT_AVATAR);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [fetchedAvatar, setFetchedAvatar] = useState('');
  const [isRemoveClicked, setIsRemoveClicked] = useState(false);

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

  const onSaveProfileImage = () => {
    onSave(profilePicAttr);
    setIsRemoveClicked(false);
    if (setLocalImagePath) {
      console.log('INSIDE', profilePicAttr);
      setLocalImagePath(profilePicAttr);
    }
  };

  //updates profile picture with user set profile picture
  async function setPicture() {
    const uri = await getProfilePictureUri();
    if (uri && uri !== '') {
      console.log('URI is: ', uri);
      setFetchedAvatar(uri);
      setImagePath(uri);
    }
  }

  useEffect(() => {
    setProfilePicAttr(localImagePath);
    (async () => {
      {
        !localImagePath && setPicture();
      }
    })();
  }, [localImagePath]);

  async function onRemovePicture() {
    setIsRemoveClicked(true);
    setSelectedAvatar('');
    setImagePath(DEFAULT_AVATAR);
    setProfilePicAttr({
      fileUri: DEFAULT_AVATAR,
      fileName: '1',
      fileType: 'avatar',
    });
  }

  const profileUri = useMemo(() => {
    if (
      profilePicAttr &&
      profilePicAttr.fileUri !== '' &&
      profilePicAttr.fileUri !== DEFAULT_AVATAR
    ) {
      console.log('1');
      return profilePicAttr.fileUri;
    } else if (
      localImagePath &&
      localImagePath.fileUri !== '' &&
      isRemoveClicked
    ) {
      console.log('2');
      return profilePicAttr.fileUri;
    } else if (localImagePath && localImagePath.fileUri !== '') {
      console.log('3');
      return localImagePath.fileUri;
    } else {
      console.log('4');
      return imagePath;
    }
  }, [imagePath, isRemoveClicked, localImagePath, profilePicAttr]);

  // console.log('ALL', profilePicAttr.fileUri, localImagePath.fileUri, imagePath);

  return (
    <View style={styles.editAvatarRegion}>
      <View>
        <GenericAvatar profileUri={profileUri} avatarSize="semiMedium" />
        <GenericButton
          buttonStyle={styles.buttonDelete}
          onPress={onRemovePicture}
          IconRight={Delete}
          iconSize={20}
        />
      </View>
      <View style={styles.mainContainer}>
        <GenericButton
          buttonStyle={styles.listItemButton}
          IconRight={GalleryOutline}
          iconSize={20}
          onPress={setNewPicture}>
          <NumberlessText
            style={{color: PortColors.primary.black}}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            Choose from Gallery
          </NumberlessText>
        </GenericButton>
      </View>
      <View style={styles.avatarArea}>
        <NumberlessText
          style={{color: PortColors.primary.black, textAlign: 'left'}}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}>
          Choose an avatar
        </NumberlessText>
        <ScrollView
          persistentScrollbar={true}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.avatarAccordion}>
          {DirectAvatarMapping.map(avatar => {
            const id = avatar.id;
            return (
              <View
                key={id}
                style={selectedAvatar === id ? styles.selectedImage : null}>
                <GenericAvatar
                  profileUri={'avatar://' + id}
                  avatarSize="xxsmall"
                  onPress={() => {
                    setSelectedAvatar(id);
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
      {setLocalImagePath ? (
        <GenericButton
          disabled={localImagePath.fileUri == profilePicAttr.fileUri}
          onPress={onSaveProfileImage}
          textStyle={styles.buttonText}
          buttonStyle={StyleSheet.compose(styles.nextButton, {
            opacity: localImagePath.fileUri == profilePicAttr.fileUri ? 0.4 : 1,
          })}>
          Save
        </GenericButton>
      ) : (
        <GenericButton
          disabled={imagePath === fetchedAvatar}
          onPress={onSaveProfileImage}
          textStyle={styles.buttonText}
          buttonStyle={StyleSheet.compose(styles.nextButton, {
            opacity: imagePath !== fetchedAvatar ? 1 : 0.4,
          })}>
          Save
        </GenericButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  editAvatarRegion: {
    flexDirection: 'column',
    gap: 20,
    width: screen.width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  selectedImage: {
    borderColor: PortColors.primary.blue.app,
    borderWidth: 3,
    height: 40,
    width: 40,
    overflow: 'hidden',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarAccordion: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  buttonDelete: {
    backgroundColor: PortColors.primary.red.error,
    padding: 6,
    width: 32,
    height: 32,
    borderRadius: 10,
    position: 'absolute',
    bottom: -6,
    right: -6,
  },
  avatarArea: {
    gap: 20,
    height: 270,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: PortColors.primary.white,
    borderColor: PortColors.primary.border.dullGrey,
    borderWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  nextButton: {
    backgroundColor: PortColors.primary.blue.app,
    height: 50,
    borderRadius: 12,
    width: screen.width - 48,
  },
  buttonText: {
    color: PortColors.primary.white,
    fontSize: 16,
  },
  mainContainer: {
    backgroundColor: PortColors.primary.white,
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    borderRadius: 16,
    borderColor: PortColors.primary.border.dullGrey,
    borderWidth: 0.5,
  },
  backButton: {
    padding: 3,
    borderRadius: 24,
    backgroundColor: 'none',
  },
  listItemButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderBottomColor: PortColors.primary.border.dullGrey,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 3,
    borderRadius: 24,
    backgroundColor: PortColors.primary.grey.medium,
  },
});
