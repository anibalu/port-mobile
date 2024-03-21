/**
 * Reusable avatar box component.
 * Takes the following props:
 * 1. profileUri (optional) - if none is specified, uses default silhouette
 * If specifying actual location use:
 *  - if loading from cache, use file://... structure
 *  - if loading from app storage, use any structure (relative or absolute).
 * If specifying an avatar use: avatar://avatar_id
 * 2. boxSize - s , m (default), l
 * 3. onPress (optional)
 */
import {DirectAvatarMapping} from '@configs/avatarmapping';
import {AVATAR_ARRAY} from '@configs/constants';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import React, {FC} from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import {SvgProps} from 'react-native-svg';

export function AvatarBox({
  profileUri = AVATAR_ARRAY[0],
  avatarSize,
  onPress,
}: {
  profileUri?: string | null;
  avatarSize: 'es' | 's' | 'i' | 'm' | 'l' | 's+';
  onPress?: () => void;
}) {
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
    } else {
      return styles.medium;
    }
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
          ? uri.replace('avatar://', '')
          : '1';
      return avatarId;
    }
    return '1';
  };

  // Function to retrieve Icon based on id. fetches default otherwise
  const getIconById = (id: string): FC<SvgProps> => {
    const avatarMappingEntry = DirectAvatarMapping.find(
      entry => entry.id === id,
    );
    return avatarMappingEntry
      ? avatarMappingEntry.Icon
      : DirectAvatarMapping[0].Icon;
  };

  // Function to retrieve Icon based on id
  const getIconByUri = (uri?: string | null): FC<SvgProps> => {
    const id = getAvatarId(uri);
    return getIconById(id);
  };
  const Icon = getIconByUri(profileUri);

  const getDisplayableUri = (uri: string): string => {
    const displayableUri =
      uri.substring(0, 7) === 'file://' ? uri : getSafeAbsoluteURI(uri, 'doc');
    return displayableUri;
  };

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
    borderRadius: 16,
  },
  large: {
    height: 170,
    width: 170,
    borderRadius: 56,
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
