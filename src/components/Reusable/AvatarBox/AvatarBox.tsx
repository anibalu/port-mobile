import React, {FC, useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, ViewStyle} from 'react-native';

import {SvgProps} from 'react-native-svg';

import {DirectAvatarMapping} from '@configs/avatarmapping';
import {AVATAR_ARRAY} from '@configs/constants';

import {getMedia} from '@utils/Storage/media';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';


/**
 * Displays the avatar
 * @param profileUri - the uri of the avatar
 * @param avatarSize - the size of the avatar
 * @param onPress - the function to call when the avatar is pressed
 * @param fromPreview - true if the avatar is from the preview, false otherwise
 * @param style - the style of the avatar box
 */
export function AvatarBox({
  profileUri = AVATAR_ARRAY[0],
  avatarSize,
  onPress,
  fromPreview = true,
  style,
}: {
  profileUri?: string | null;
  avatarSize: 'es' | 's' | 'i' | 'm' | 'l' | 'xl' | 's+' | 's++';
  onPress?: () => void;
  fromPreview?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={StyleSheet.compose(
        {
          ...styles.container,
          ...sizeStylePicker(avatarSize),
        },
        style,
      )}>
      <DisplaySVG uri={profileUri} avatarSize={avatarSize} />
      {profileUri && (
        <DisplayMedia
          mediaUri={profileUri}
          avatarSize={avatarSize}
          fromPreview={fromPreview}
        />
      )}
    </Pressable>
  );
}

/**
 * Displays the svg
 * @param uri - the uri of the svg
 * @param avatarSize - the size of the avatar
 */
const DisplaySVG = ({
  uri,
  avatarSize,
}: {
  uri?: string | null;
  avatarSize: 'es' | 's' | 'i' | 'm' | 'l' | 'xl' | 's+' | 's++';
}) => {
  //avatar Icon as a fallback
  const Icon = getIconByUri(uri);
  return (
    <Icon
      height={sizeStylePicker(avatarSize).height}
      width={sizeStylePicker(avatarSize).width}
      style={{position: 'absolute'}}
    />
  );
};

/**
 * Fetches the avatar Id (1 is default)
 * @param uri - the uri of the avatar
 * @returns the avatar Id. If the uri is not an avatar uri, returns '1'
 */
const getAvatarId = (uri?: string | null) => {
  if (uri) {
    const avatarId =
      uri.substring(0, 9) === 'avatar://'
        ? uri.replace(/^avatar:\/\//, '')
        : '1';
    return avatarId;
  }
  return '1';
};

/**
 * Retrieves the icon based on the uri
 * @param uri - the uri of the avatar
 * @returns the icon based on the uri. If the uri is not an avatar uri, returns the default avatar icon.
 */
const getIconByUri = (uri?: string | null): FC<SvgProps> => {
  const id = getAvatarId(uri);
  return getIconById(id);
};

/**
 * Retrieves the icon based on the id
 * @param id - the id of the avatar
 * @returns the icon based on the id. If the id is not found, returns the default avatar icon.
 */
const getIconById = (id: string): FC<SvgProps> => {
  const avatarMappingEntry = DirectAvatarMapping.find(entry => entry.id === id);
  return avatarMappingEntry
    ? avatarMappingEntry.Icon
    : DirectAvatarMapping[0].Icon;
};

/**
 * Checks if the uri is prefixed with media://
 * @param uri - the uri of the avatar
 * @returns true if the uri is prefixed with media://, false otherwise
 */
const isMediaUri = (uri?: string | null) => {
  if (uri) {
    const isMedia = uri.substring(0, 8) === 'media://';
    return isMedia;
  }
  return false;
};

/**
 * Checks if the uri is prefixed with avatar://
 * @param uri - the uri of the avatar
 * @returns true if the uri is prefixed with avatar://, false otherwise
 */
const isAvatarUri = (uri?: string | null) => {
  if (uri) {
    const isAvatar = uri.substring(0, 9) === 'avatar://';
    return isAvatar;
  }
  return false;
};

/**
 * Retrieves the media id from the uri
 * @param uri - the uri of the media
 * @returns the media id from the uri
 */
const getMediaId = (uri: string) => {
  return uri.replace(/^media:\/\//, '');
};

/**
 * Retrieves the displayable uri from the uri
 * @param uri - the uri of the media
 * @returns the displayable uri from the uri
 */
const getDisplayableUri = (uri: string): string => {
  const displayableUri =
    // 'content' substring is for phonebook contact's thumbnail uri in android
    uri.substring(0, 7) === 'content'
      ? uri
      : uri.substring(0, 7) === 'file://'
      ? uri
      : getSafeAbsoluteURI(uri);
  return displayableUri;
};

/**
 * Displays the media
 * @param mediaUri - the uri of the media
 * @param avatarSize - the size of the avatar
 * @param fromPreview - true if the media is from the preview, false otherwise
 */
function DisplayMedia({
  mediaUri,
  avatarSize,
  fromPreview,
}: {
  mediaUri: string;
  avatarSize: 'es' | 's' | 'i' | 'm' | 'l' | 's+' | 'xl' | 's++';
  fromPreview: boolean;
}) {
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (!isAvatarUri(mediaUri)) {
      (async () => {
        if (isMediaUri(mediaUri)) {
          const mediaInfo = await getMedia(getMediaId(mediaUri));
          if (mediaInfo) {
            const previewUri = mediaInfo.previewPath;
            const mainUri = mediaInfo.filePath;
            if (fromPreview) {
              setImageUri(getDisplayableUri(previewUri ? previewUri : mainUri));
            } else {
              setImageUri(getDisplayableUri(mainUri));
            }
          }
        } else {
          setImageUri(getDisplayableUri(mediaUri));
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaUri]);

  return (
    <>
      {imageUri && (
        <Image source={{uri: imageUri}} style={sizeStylePicker(avatarSize)} />
      )}
    </>
  );
}

function sizeStylePicker(avatarSize?: string) {
  switch (avatarSize) {
    case 'es':
      return styles.es;
    case 's':
      return styles.s;
    case 's+':
      return styles.sp;
    case 's++':
      return styles.spp;
    case 'm':
      return styles.m;
    case 'i':
      return styles.i;
    case 'l':
      return styles.l;
    case 'xl':
      return styles.xl;
    default:
      return styles.m;
  }
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 400,
  },
  es: {
    height: 24,
    width: 24,
  },
  s: {
    height: 40,
    width: 40,
  },
  sp: {
    height: 58,
    width: 58,
  },
  spp: {
    height: 48,
    width: 48,
  },
  i: {
    height: 60,
    width: 60,
  },
  m: {
    height: 90,
    width: 90,
  },
  l: {
    height: 170,
    width: 170,
  },
  xl: {
    height: 300,
    width: 300,
  },
});
