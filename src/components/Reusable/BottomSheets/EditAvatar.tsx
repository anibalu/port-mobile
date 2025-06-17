import React, {useEffect, useMemo, useState} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { FlatList } from 'react-native-gesture-handler';
import {launchImageLibrary} from 'react-native-image-picker';

import BaseBottomSheet from '@components/BaseBottomsheet';
import PrimaryButton from '@components/Buttons/PrimaryButton';
import GradientCard from '@components/Cards/GradientCard';
import {Colors, useColors} from '@components/colorGuide';
import {screen} from '@components/ComponentUtils';
import {FontSizeType,FontWeight,NumberlessText} from '@components/NumberlessText';
import OptionWithLogoAndChevronWithoutDescription from '@components/Options/OptionWithLogoAndChevronWithoutDescription';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import LineSeparator from '@components/Separators/LineSeparator';
import {Size, Spacing, Width} from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

import {DirectAvatarMapping} from '@configs/avatarmapping';
import {DEFAULT_PROFILE_AVATAR_INFO} from '@configs/constants';

import {compressImage} from '@utils/Compressor/graphicCompressors';
import {FileAttributes} from '@utils/Storage/StorageRNFS/interfaces';

import Delete from '@assets/icons/TrashcanWhite.svg';



interface EditAvatarProps {
  localImageAttr: FileAttributes;
  setLocalImageAttr: any;
  onSave: (attr: FileAttributes) => Promise<void>;
  onClose: () => void;
  visible: boolean;
}

/**
 * This component is responsible for allowing a user to change their profile picture.
 * It takes the following props:
 * 1. localImageAttr: FileAttributes - initial profile pic attributes
 * 2. setLocalImageAttr - set profile pic attributes on parent screen
 * 3. onSave - on save function to save new profile pic attributes
 * 4. onClose - on close function for bottom sheet
 * 5. visible - to determine if bottom sheet should be visible
 */
export default function EditAvatar({
  localImageAttr,
  setLocalImageAttr,
  onSave,
  onClose,
  visible,
}: EditAvatarProps) {
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

  //Lets user pic a new picture from gallery and compress it.
  async function setNewPicture() {
    try {
      const selectedAssets = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });
      // setting profile uri for display
      if (
        selectedAssets.assets &&
        selectedAssets.assets[0] &&
        selectedAssets.assets[0].uri
      ) {
        const compressedUri = await compressImage(selectedAssets.assets[0].uri);
        console.log('compression uri: ', compressedUri);
        setImageAttr({
          fileUri: compressedUri || selectedAssets.assets[0].uri,
          fileName: selectedAssets.assets[0].fileName || 'profilePic',
          fileType: selectedAssets.assets[0].type || 'image',
        });
        setSelectedAvatar('');
      }
    } catch (error) {
      console.log('Nothing selected', error);
    }
  }

  //selects an avatar
  const onSelectAvatar = (id: string) => {
    const newAttr = {
      fileUri: 'avatar://' + id,
      fileName: id,
      fileType: 'avatar',
    };
    setImageAttr(newAttr);
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
    onClose();
  }

  //function that gets run when a profile picture is removed
  async function onRemovePicture() {
    setImageAttr(DEFAULT_PROFILE_AVATAR_INFO);
    setSelectedAvatar(avatarArray[0].id.toString());
  }

  //find number of columns possible
  function calculateColumns() {
    return Math.floor((screen.width - 4 * Spacing.l) / 48);
  }
  const colors = useColors();
  const styles = styling(colors);

  const svgArray = [
    {
      assetName: 'GalleryIcon',
      light: require('@assets/light/icons/Gallery.svg').default,
      dark: require('@assets/dark/icons/Gallery.svg').default,
    },
  ];
  const results = useSVG(svgArray);

  const GalleryIcon = results.GalleryIcon;

  return (
    <BaseBottomSheet
      bgColor="w"
      visible={visible}
      onClose={onClose}
 >
      <View style={styles.connectionOptionsRegion}>
        <View style={styles.mainContainer}>
          <NumberlessText
            textColor={colors.text.title}
            fontSizeType={FontSizeType.xl}
            fontWeight={FontWeight.sb}>
            Choose your profile picture
          </NumberlessText>
          <LineSeparator style={{width: Width.screen}} />
        </View>
      </View>
      <View style={styles.profilePictureHitbox}>
        <AvatarBox profileUri={imageAttr.fileUri} avatarSize="m" />
        {imageAttr.fileUri !== DEFAULT_PROFILE_AVATAR_INFO.fileUri && (
          <Pressable style={styles.updatePicture} onPress={onRemovePicture}>
            <Delete width={20} height={20} />
          </Pressable>
        )}
      </View>
      <View
        style={{
          width: Width.screen - 2 * Spacing.l,
          marginVertical: Spacing.xl,
        }}>
        <OptionWithLogoAndChevronWithoutDescription
          title={'Choose from gallery'}
          IconLeft={GalleryIcon}
          onClick={setNewPicture}
        />
      </View>
      <GradientCard style={styles.avatarArea}>
        <NumberlessText
          style={{alignSelf: 'flex-start', marginLeft: Spacing.l}}
          textColor={colors.text.title}
          fontSizeType={FontSizeType.l}
          fontWeight={FontWeight.rg}>
          Choose an avatar
        </NumberlessText>
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
            paddingHorizontal: Spacing.l,
          }}
        />
    

      </GradientCard>
      <View style={{width: Width.screen - 2 * Spacing.l, marginTop: Spacing.l}}>
        <PrimaryButton
          disabled={localImageAttr.fileUri === imageAttr.fileUri}
          isLoading={isLoading}
          onClick={onSaveProfileImage}
          text={'Save'}
          theme={colors.theme}
        />
      </View>
    </BaseBottomSheet>
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
    <View style={avatarStyles.avatarBoxPressable}>
      <View>
        {isLoading ? (
          <Animated.View style={{opacity: opacityAnimation}}>
            <View style={avatarStyles.placeholder} />
          </Animated.View>
        ) : (
          <AvatarBox
            avatarSize="s"
            profileUri={'avatar://' + id}
            onPress={() => {
              onClick(id);
            }}
            style={
              id === selected && !isLoading
                ? {
                    borderWidth: 3,
                    borderColor: Colors.common.boldAccentColors.blue,
                    borderRadius: 100,
                  }
                : {}
            }
          />
        )}
      </View>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  avatarBoxPressable: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBoxBorder: {
    width: 40,
    height: 40,
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 100,
    width: 40,
    height: 40,
  },
});

const styling = (colors: any) =>
  StyleSheet.create({
    connectionOptionsRegion: {
      width: Width.screen,
      paddingHorizontal: Spacing.l,
    },
    mainContainer: {
      width: '100%',
      paddingTop: Spacing.s,
      flexDirection: 'column',
      alignItems: 'center',
      gap: Spacing.m,
    },
    profilePictureHitbox: {
      marginVertical: Spacing.l,
      paddingHorizontal: Spacing.xl,
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      alignSelf: 'center',
    },
    avatarArea: {
      height: 270,
      width: Width.screen - 2 * Spacing.l,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.l,
      gap: Spacing.l,
      backgroundColor: colors.surface2,
    },
    updatePicture: {
      width: Size.xl,
      height: Size.xl,
      backgroundColor: colors.red,
      position: 'absolute',
      bottom: -Spacing.s,
      right: Spacing.l,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: Spacing.l,
    },
  });
