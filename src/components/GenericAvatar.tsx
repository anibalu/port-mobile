import {avatarmapping} from '@configs/avatarmapping';
import {AVATAR_ARRAY} from '@configs/constants';
import React, {FC} from 'react';
import {Image, ImageStyle, Pressable, StyleSheet} from 'react-native';
import {SvgProps} from 'react-native-svg';

//profile uri => file://pathtoimage.jpg
//avatar uri => avatar://avatar_id
export function GenericAvatar({
  avatarSize,
  profileUri = AVATAR_ARRAY[0],
  onPress,
}: {
  avatarSize: 'extraSmall' | 'small' | 'medium' | 'large'; //size - extraSmall, small, medium, large || default - large
  profileUri?: string | null;
  onPress?: (() => void) | null;
}) {
  // set size of avatar according to specs
  function avatarSizeStylePicker(avatarSize?: string): ImageStyle {
    if (avatarSize === 'small') {
      return styles.small;
    } else if (avatarSize === 'medium') {
      return styles.medium;
    } else if (avatarSize === 'large') {
      return styles.large;
    } else if (avatarSize === 'extraSmall') {
      return styles.extraSmall;
    } else {
      return styles.large;
    }
  }
  const getAvatarId = (uri?: string | null) => {
    const avatarId =
      uri?.substring(0, 9) === 'avatar://' ? uri.replace('avatar://', '') : '0';
    if (!uri) {
      return '1';
    }
    return avatarId;
  };
  // Function to retrieve Icon based on id
  const getIconById = (id: string): FC<SvgProps> | null => {
    const avatarMappingEntry = avatarmapping.find(entry => entry.id === id);
    return avatarMappingEntry ? avatarMappingEntry.Icon : null;
  };
  // Function to retrieve Icon based on id
  const getIconByUri = (uri?: string | null): FC<SvgProps> | null => {
    const id = getAvatarId(uri);
    return getIconById(id);
  };
  const Icon = getIconByUri(profileUri);
  return (
    <Pressable
      onPress={onPress}
      style={StyleSheet.compose(
        styles.container,
        avatarSizeStylePicker(avatarSize),
      )}>
      {profileUri && getAvatarId(profileUri) === '0' && (
        <Image
          source={{uri: profileUri}}
          style={avatarSizeStylePicker(avatarSize)}
        />
      )}
      {Icon ? (
        <Icon
          height={avatarSizeStylePicker(avatarSize).height}
          width={avatarSizeStylePicker(avatarSize).width}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraSmall: {
    height: 42,
    width: 42,
    borderRadius: 14,
  },
  small: {
    height: 50,
    width: 50,
    borderRadius: 20,
  },
  large: {
    height: 170,
    width: 170,
    borderRadius: 56,
  },
  medium: {
    height: 132,
    width: 132,
    borderRadius: 44,
  },
});
