/**
 * Reusable avatar box component.
 * Takes the following props:
 * 1. profileUri (optional) - if none is specified, uses default silhouette
 * 2. boxSize - s , m (default), l
 * 3. onPress (optional)
 */
import {DirectAvatarMapping} from '@configs/avatarmapping';
import {AVATAR_ARRAY} from '@configs/constants';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import {getMedia} from '@utils/Storage/media';
import React, {FC, useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import {SvgProps} from 'react-native-svg';

export function AvatarBox({
  profileUri = AVATAR_ARRAY[0],
  avatarSize,
  onPress,
  fromPreview = true,
}: {
  profileUri?: string | null;
  avatarSize: 'es' | 's' | 'i' | 'm' | 'l' | 'xl' | 's+';
  onPress?: () => void;
  fromPreview?: boolean;
}) {
  const Icon = getIconByUri(profileUri);

  return (
    <Pressable
      onPress={onPress}
      style={StyleSheet.compose(
        styles.container,
        avatarSizeStylePicker(avatarSize),
      )}>
      {isAvatarUri(profileUri) ? (
        <Icon
          height={avatarSizeStylePicker(avatarSize).height}
          width={avatarSizeStylePicker(avatarSize).width}
        />
      ) : isMediaUri(profileUri) ? (
        profileUri && (
          <DisplayFromMediaId
            mediaUri={profileUri}
            avatarSize={avatarSize}
            fromPreview={fromPreview}
          />
        )
      ) : (
        profileUri && (
          <Image
            source={{uri: getDisplayableUri(profileUri)}}
            style={avatarSizeStylePicker(avatarSize)}
          />
        )
      )}
    </Pressable>
  );
}

const isAvatarUri = (uri?: string | null) => {
  if (uri) {
    const isAvatar = uri.substring(0, 9) === 'avatar://';
    return isAvatar;
  }
  return true;
};

// fetches avatar Id (1 is default)
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

// set size of avatar according to specs
function avatarSizeStylePicker(avatarSize?: string) {
  if (avatarSize === 'es') {
    return styles.extraSmall;
  } else if (avatarSize === 's') {
    return styles.small;
  } else if (avatarSize === 's+') {
    return styles.smallMedium;
  } else if (avatarSize === 'm') {
    return styles.medium;
  } else if (avatarSize === 'i') {
    return styles.intermediate;
  } else if (avatarSize === 'l') {
    return styles.large;
  } else if (avatarSize === 'xl') {
    return styles.extraLarge;
  } else {
    return styles.medium;
  }
}

// Function to retrieve Icon based on id. fetches default otherwise
const getIconById = (id: string): FC<SvgProps> => {
  const avatarMappingEntry = DirectAvatarMapping.find(entry => entry.id === id);
  return avatarMappingEntry
    ? avatarMappingEntry.Icon
    : DirectAvatarMapping[0].Icon;
};

// Function to retrieve Icon based on id
const getIconByUri = (uri?: string | null): FC<SvgProps> => {
  const id = getAvatarId(uri);
  return getIconById(id);
};

const isMediaUri = (uri?: string | null) => {
  if (uri) {
    const isMedia = uri.substring(0, 8) === 'media://';
    return isMedia;
  }
  return true;
};

const getDisplayableUri = (uri: string): string => {
  const displayableUri =
    uri.substring(0, 7) === 'file://' ? uri : getSafeAbsoluteURI(uri, 'doc');
  return displayableUri;
};

function DisplayFromMediaId({
  mediaUri,
  avatarSize,
  fromPreview,
}: {
  mediaUri: string;
  avatarSize: 'es' | 's' | 'i' | 'm' | 'l' | 's+';
  fromPreview: boolean;
}) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  // fetches media Id
  const getMediaId = (uri: string) => {
    return uri.replace(/^media:\/\//, '');
  };
  useEffect(() => {
    (async () => {
      const mediaInfo = await getMedia(getMediaId(mediaUri));
      if (mediaInfo) {
        const previewUri = mediaInfo.previewPath;
        const mainUri = mediaInfo.filePath;
        if (fromPreview) {
          setImageUri(previewUri ? previewUri : mainUri);
        } else {
          setImageUri(mainUri);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaUri]);
  return (
    <>
      {imageUri && (
        <Image
          source={{uri: getDisplayableUri(imageUri)}}
          style={avatarSizeStylePicker(avatarSize)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  extraSmall: {
    height: 24,
    width: 24,
    borderRadius: 6,
  },
  small: {
    height: 40,
    width: 40,
    borderRadius: 12,
  },
  smallMedium: {
    height: 58,
    width: 58,
    borderRadius: 12,
  },
  large: {
    height: 170,
    width: 170,
    borderRadius: 56,
  },
  extraLarge: {
    height: 300,
    width: 300,
    borderRadius: 5,
  },
  intermediate: {
    height: 75,
    width: 75,
    borderRadius: 12,
  },
  medium: {
    height: 100,
    width: 100,
    borderRadius: 32,
  },
});
