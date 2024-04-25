/**
 * This component is responsible for allowing a user to change their profile picture.
 * It takes the following props:
 * 1. localImageAttr: FileAttributes - initial profile pic attributes
 * 2. setLocalImageAttr - set profile pic attributes on parent screen
 * 3. onSave - on save function to save new profile pic attributes
 * 4. onClose - on close function for bottom sheet
 * 5. visible - to determine if bottom sheet should be visible
 */

import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, View, FlatList, Animated, Easing} from 'react-native';

import Delete from '@assets/icons/TrashcanWhite.svg';
import GalleryOutline from '@assets/icons/GalleryOutline.svg';
import {
  PortColors,
  PortSpacing,
  isIOS,
  screen,
} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import {DEFAULT_AVATAR, DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';
import {launchImageLibrary} from 'react-native-image-picker';
import {FileAttributes} from '@utils/Storage/interfaces';
import {DirectAvatarMapping} from '@configs/avatarmapping';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {AvatarBox} from '../AvatarBox/AvatarBox';
import PrimaryButton from '../LongButtons/PrimaryButton';
import OptionWithRightIcon from '../OptionButtons/OptionWithRightIcon';
import SimpleCard from '../Cards/SimpleCard';

interface EditAvatarProps {
  localImageAttr: FileAttributes;
  setLocalImageAttr: any;
  onSave: (attr: FileAttributes) => Promise<void>;
  onClose: () => void;
  visible: boolean;
}

export default function EditAvatar(props: EditAvatarProps) {
  const {localImageAttr, setLocalImageAttr, onSave, onClose, visible} = props;

  //maintains local state interms of which avatar or picture is chosen.
  const [imageAttr, setImageAttr] = useState<FileAttributes>(localImageAttr);
  //constains the id of the selected avatar. empty string if profile image is not an avatar.
  const [selectedAvatar, setSelectedAvatar] = useState(
    localImageAttr.fileUri.substring(0, 9) === 'avatar://'
      ? localImageAttr.fileUri.replace('avatar://', '')
      : '',
  );
  //list of all avatars available. id:1 is default
  const avatarArray = Array.from(
    {length: DirectAvatarMapping.length},
    (_, index) => {
      return {id: index + 1};
    },
  );
  //loader waits for save to finish
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //updates imageAttr and selectedAvatar if localImageAttr changes
  useEffect(() => {
    setImageAttr(localImageAttr);
    setSelectedAvatar(
      localImageAttr.fileUri.substring(0, 9) === 'avatar://'
        ? localImageAttr.fileUri.replace('avatar://', '')
        : '',
    );
  }, [localImageAttr]);

  //reset state values to initial values on closing
  const cleanClose = () => {
    onClose();
  };
  //Lets user pic a new picture from gallery
  async function setNewPicture() {
    try {
      const selectedAssets = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });
      // setting profile uri for display
      if (selectedAssets.assets && selectedAssets.assets[0]) {
        setImageAttr({
          fileUri: selectedAssets.assets[0].uri || DEFAULT_AVATAR,
          fileName: selectedAssets.assets[0].fileName || '1',
          fileType: selectedAssets.assets[0].type || 'avatar',
        });
        setSelectedAvatar('');
      }
    } catch (error) {
      console.log('Nothing selected', error);
    }
  }

  //selects an avatar
  const onSelectAvatar = (id: string) => {
    setImageAttr({
      fileUri: 'avatar://' + id,
      fileName: id,
      fileType: 'avatar',
    });
    setSelectedAvatar(id);
  };

  //function that gets run on saving new profile picture
  async function onSaveProfileImage() {
    setIsLoading(true);
    if (imageAttr.fileUri !== localImageAttr.fileUri) {
      setLocalImageAttr(imageAttr);
      await onSave(imageAttr);
    }
    setIsLoading(false);
    cleanClose();
  }

  //function that gets run when a profile picture is removed
  async function onRemovePicture() {
    setImageAttr(DEFAULT_PROFILE_AVATAR_INFO);
    setSelectedAvatar(avatarArray[0].id.toString());
  }

  //find number of columns possible
  function calculateColumns() {
    return Math.floor(
      (screen.width - 4 * PortSpacing.intermediate.uniform) / 48,
    );
  }

  return (
    <PrimaryBottomSheet
      bgColor="g"
      visible={visible}
      showClose={true}
      onClose={cleanClose}
      title={'Change your profile picture'}>
      <View style={styles.container}>
        <View style={styles.mainAvatarContainer}>
          <AvatarBox profileUri={imageAttr.fileUri} avatarSize="m" />
          {imageAttr.fileUri !== DEFAULT_PROFILE_AVATAR_INFO.fileUri && (
            <GenericButton
              buttonStyle={styles.buttonDelete}
              onPress={onRemovePicture}
              IconRight={Delete}
              iconSize={20}
            />
          )}
        </View>
        <SimpleCard style={{marginBottom: PortSpacing.secondary.bottom}}>
          <OptionWithRightIcon
            title={'Choose from gallery'}
            IconRight={GalleryOutline}
            onClick={setNewPicture}
          />
        </SimpleCard>
        <SimpleCard style={styles.avatarArea}>
          <OptionWithRightIcon title={'Choose an avatar'} onClick={() => {}} />
          <FlatList
            data={avatarArray}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => (
              <RenderAvatar
                id={item.id.toString()}
                selected={selectedAvatar}
                onClick={onSelectAvatar}
              />
            )}
            numColumns={calculateColumns()}
            style={{
              paddingHorizontal: PortSpacing.secondary.uniform,
            }}
          />
        </SimpleCard>
        <PrimaryButton
          disabled={localImageAttr.fileUri === imageAttr.fileUri}
          isLoading={isLoading}
          onClick={onSaveProfileImage}
          primaryButtonColor={'b'}
          buttonText={'Save'}
        />
      </View>
    </PrimaryBottomSheet>
  );
}

function RenderAvatar({
  id,
  selected,
  onClick,
}: {
  id: string;
  selected: string;
  onClick: (id: string) => void;
}) {
  const opacityAnimation = useMemo(() => new Animated.Value(1), []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [id]);

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnimation, {
          toValue: 0.3,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 350,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    if (isLoading) {
      breathingAnimation.start();
    } else {
      breathingAnimation.stop();
      opacityAnimation.setValue(1);
    }

    return () => {
      breathingAnimation.stop();
    };
  }, [isLoading, opacityAnimation]);

  return (
    <View style={styles.avatarBoxPressable}>
      <View
        style={StyleSheet.compose(
          styles.avatarBoxBorder,
          id === selected && !isLoading
            ? {
                borderWidth: 3,
                borderColor: PortColors.primary.blue.app,
              }
            : {},
        )}>
        {isLoading ? (
          <Animated.View style={{opacity: opacityAnimation}}>
            <View style={styles.placeholder} />
          </Animated.View>
        ) : (
          <AvatarBox
            avatarSize="s"
            profileUri={'avatar://' + id}
            onPress={() => {
              onClick(id);
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    width: 40,
    height: 40,
  },
  mainAvatarContainer: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginVertical: PortSpacing.intermediate.uniform,
    alignItems: 'center',
  },
  avatarBoxPressable: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBoxBorder: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    height: 270,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PortColors.primary.white,
    borderColor: PortColors.primary.border.dullGrey,
    marginBottom: PortSpacing.secondary.bottom,
  },
});
