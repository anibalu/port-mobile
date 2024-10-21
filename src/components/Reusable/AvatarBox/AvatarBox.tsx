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
  isHomeContact = false,
}: {
  profileUri?: string | null;
  avatarSize: 'es' | 's' | 'i' | 'm' | 'l' | 'xl' | 's+' | 's++';
  onPress?: () => void;
  fromPreview?: boolean;
  isHomeContact?: boolean;
}) {
  const Icon = getIconByUri(profileUri);

  return (
    <Pressable
      onPress={onPress}
      style={StyleSheet.compose(
        containerStyles.container,
        avatarContainerSizeStylePicker(avatarSize, isHomeContact),
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
            isHomeContact={isHomeContact}
          />
        )
      ) : (
        profileUri && (
          <Image
            source={{uri: getDisplayableUri(profileUri)}}
            style={avatarContainerSizeStylePicker(avatarSize, isHomeContact)}
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

// set size of avatar container according to specs
function avatarContainerSizeStylePicker(
  avatarSize?: string,
  isHomeContact?: boolean,
) {
  if (avatarSize === 'es') {
    return containerStyles.extraSmall;
  } else if (avatarSize === 's') {
    return containerStyles.small;
  } else if (avatarSize === 's+') {
    return containerStyles.smallMedium;
  } else if (avatarSize === 's++') {
    return containerStyles.mediumSmall;
  } else if (avatarSize === 'm') {
    if (isHomeContact) {
      return containerStyles.mediumHome;
    } else {
      return containerStyles.medium;
    }
  } else if (avatarSize === 'i') {
    return containerStyles.intermediate;
  } else if (avatarSize === 'l') {
    return containerStyles.large;
  } else if (avatarSize === 'xl') {
    return containerStyles.extraLarge;
  } else {
    return containerStyles.medium;
  }
}

//set size of avatar according to specs
function avatarSizeStylePicker(avatarSize?: string, isHomeContact?: boolean) {
  if (avatarSize === 'es') {
    return avatarStyles.extraSmall;
  } else if (avatarSize === 's') {
    return avatarStyles.small;
  } else if (avatarSize === 's+') {
    return avatarStyles.smallMedium;
  } else if (avatarSize === 's++') {
    return avatarStyles.mediumSmall;
  } else if (avatarSize === 'm') {
    if (isHomeContact) {
      return avatarStyles.mediumHome;
    } else {
      return avatarStyles.medium;
    }
  } else if (avatarSize === 'i') {
    return avatarStyles.intermediate;
  } else if (avatarSize === 'l') {
    return avatarStyles.large;
  } else if (avatarSize === 'xl') {
    return avatarStyles.extraLarge;
  } else {
    return avatarStyles.medium;
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
    // 'content' substring is for phonebook contact's thumbnail uri in android
    uri.substring(0, 7) === 'content'
      ? uri
      : uri.substring(0, 7) === 'file://'
      ? uri
      : getSafeAbsoluteURI(uri, 'doc');
  return displayableUri;
};

function DisplayFromMediaId({
  mediaUri,
  avatarSize,
  fromPreview,
  isHomeContact = false,
}: {
  mediaUri: string;
  avatarSize: 'es' | 's' | 'i' | 'm' | 'l' | 's+' | 'xl' | 's++';
  fromPreview: boolean;
  isHomeContact?: boolean;
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
          style={avatarContainerSizeStylePicker(avatarSize, isHomeContact)}
        />
      )}
    </>
  );
}

const containerStyles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  extraSmall: {
    height: 24,
    width: 24,
    borderRadius: 100,
  },
  small: {
    height: 40,
    width: 40,
    borderRadius: 100,
  },
  smallMedium: {
    height: 58,
    width: 58,
    borderRadius: 150,
  },
  mediumSmall: {
    height: 48,
    width: 48,
    borderRadius: 150,
  },
  large: {
    height: 170,
    width: 170,
    borderRadius: 500,
  },
  extraLarge: {
    height: 300,
    width: 300,
    borderRadius: 600,
  },
  intermediate: {
    height: 75,
    width: 75,
    borderRadius: 8,
  },
  medium: {
    height: 100,
    width: 100,
    borderRadius: 200,
  },
  mediumHome: {
    height: 100,
    width: 100,
    borderRadius: 200,
    borderWidth: 2,
    borderColor: '#F99520',
  },
});

//SVG scaling is not perfect. sometimes, we need the SVGs to be slightly bigger than their container to fit properly.
const avatarStyles = StyleSheet.create({
  extraSmall: {
    height: 24,
    width: 24,
    borderRadius: 100,
  },
  small: {
    height: 40,
    width: 40,
    borderRadius: 100,
  },
  smallMedium: {
    height: 58,
    width: 58,
    borderRadius: 150,
  },
  mediumSmall: {
    height: 48,
    width: 48,
    borderRadius: 120,
  },
  large: {
    height: 170,
    width: 170,
    borderRadius: 500,
  },
  extraLarge: {
    height: 300,
    width: 300,
    borderRadius: 600,
  },
  intermediate: {
    height: 75,
    width: 75,
    borderRadius: 8,
  },
  medium: {
    height: 105,
    width: 105,
    borderRadius: 200,
  },
  mediumHome: {
    height: 105,
    width: 105,
    borderRadius: 200,
    borderWidth: 2,
    borderColor: '#F99520',
  },
});
