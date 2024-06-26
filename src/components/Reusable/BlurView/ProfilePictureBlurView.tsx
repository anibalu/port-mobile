import {StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {isIOS, screen} from '@components/ComponentUtils';
import {AvatarBox} from '../AvatarBox/AvatarBox';
import {CustomStatusBar} from '@components/CustomStatusBar';

const ProfilePictureBlurViewModal = ({
  avatarUrl,
  onClose,
}: {
  avatarUrl: string;
  onClose: () => void;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onClose}
      style={styles.mainContainer}>
      <AvatarBox onPress={() => {}} profileUri={avatarUrl} avatarSize="xl" />
      {!isIOS && <CustomStatusBar backgroundColor="#00000000" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000000BF',
    alignItems: 'center',
    justifyContent: 'center',
    height: screen.height,
    width: screen.width,
  },
});

export default ProfilePictureBlurViewModal;
