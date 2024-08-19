/**
 * Card that displays a port or a superport
 * Takes the following props:
 * 1. isLoading - whether the bundle to display is still generating
 * 2. hasFailed - whether bundle generation has failed
 * 3. isSuperport - whether card is for a superport
 * 4. profileUri - profile picture to display
 * 5. title - title to display (profile name is passed in currently)
 * 6. qrData - qr data to display
 * 9. onTryAgainClicked - what to do when try again is clicked
 */

import React, {useMemo, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import SimpleCard from '../Cards/SimpleCard';
import QrWithLogo from '../QR/QrWithLogo';
import {
  DEFAULT_PROFILE_AVATAR_INFO,
  NAME_LENGTH_LIMIT,
} from '@configs/constants';
import Logo from '@assets/icons/Portlogo.svg';
import MultiuseQr from '@assets/icons/MultiuseQr.svg';

import {PortColors, PortSpacing, isIOS} from '@components/ComponentUtils';
import {
  DirectSuperportBundle,
  GroupBundle,
  GroupSuperportBundle,
  PortBundle,
} from '@utils/Ports/interfaces';
import EditAvatar from '../BottomSheets/EditAvatar';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';
import {FontSizeType, FontType} from '@components/NumberlessText';

const ShareablePortCard = ({
  profilePicAttr = DEFAULT_PROFILE_AVATAR_INFO,
  title,
  qrData,
  toBeEdited,
}: {
  profilePicAttr?: FileAttributes;
  title: string;
  qrData:
    | PortBundle
    | GroupBundle
    | DirectSuperportBundle
    | GroupSuperportBundle
    | null;
  toBeEdited: boolean;
}) => {
  const [profilePictureAttributes, setProfilePcitureAttributes] =
    useState<FileAttributes>(profilePicAttr);
  const [newName, setNewName] = useState(title);
  const [description, setDescription] = useState(
    'Scan this code with your Port camera to add me as a contact.',
  );

  const [newQrData, setNewQrData] = useState(qrData);
  const [openEditAvatarModal, setOpenEditAvatarModal] = useState(false);
  const onChangeText = (text: string) => {
    setNewName(text);
  };
  const onChangeDescription = (description: string) => {
    setDescription(description);
  };

  useMemo(() => {
    if (newName) {
      setNewQrData({...qrData, name: newName});
    }
  }, [newName, qrData]);

  return (
    <SimpleCard style={styles.cardWrapper}>
      <Logo
        style={{
          alignSelf: 'center',
          marginTop: PortSpacing.intermediate.top,
          marginBottom: PortSpacing.tertiary.bottom,
        }}
      />
      <MultiuseQr
        style={{
          alignSelf: 'center',
          marginBottom: PortSpacing.tertiary.top,
        }}
      />

      <QrWithLogo
        onClickAvatar={() => setOpenEditAvatarModal(true)}
        tobeEdited={toBeEdited}
        profileUri={profilePictureAttributes.fileUri}
        qrData={newQrData}
        isLoading={false}
        hasFailed={false}
      />

      <View style={styles.contentBox}>
        <TextInput
          style={StyleSheet.compose(
            [
              toBeEdited
                ? {textDecorationLine: 'underline'}
                : {
                    textDecorationLine: 'none',
                  },
            ],
            styles.name,
          )}
          maxLength={NAME_LENGTH_LIMIT}
          onChangeText={onChangeText}
          value={newName}
          editable={toBeEdited}
        />
        <TextInput
          multiline
          style={StyleSheet.compose(
            [
              toBeEdited
                ? {textDecorationLine: 'underline'}
                : {
                    textDecorationLine: 'none',
                  },
            ],
            styles.description,
          )}
          maxLength={200}
          onChangeText={onChangeDescription}
          value={description}
          editable={toBeEdited}
        />
      </View>
      <EditAvatar
        localImageAttr={profilePictureAttributes}
        setLocalImageAttr={setProfilePcitureAttributes}
        visible={openEditAvatarModal}
        onSave={() => {}}
        onClose={() => {
          setOpenEditAvatarModal(false);
        }}
      />
    </SimpleCard>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 0, //overrides simple card default padding
    width: '100%',
    backgroundColor: 'white',
  },
  avatarArea: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    width: 60,
    borderRadius: 12,
    backgroundColor: PortColors.primary.white,
    marginTop: -30,
  },
  contentBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  name: {
    color: 'black',
    fontFamily: FontType.md,
    fontSize: FontSizeType.xl,
  },
  description: {
    color: '#667085',
    fontFamily: FontType.rg,
    fontSize: FontSizeType.m,
    textAlign: 'center',
    marginBottom: PortSpacing.secondary.uniform,
    marginTop: isIOS ? 0 : -PortSpacing.secondary.top,
    paddingHorizontal: PortSpacing.intermediate.uniform,
  },
  edit: {
    position: 'absolute',
    right: -3,
    bottom: -3,
  },
});

export default ShareablePortCard;
