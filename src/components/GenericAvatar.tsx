import {avatarmapping} from '@configs/avatarmapping';
import React from 'react';
import {StyleSheet, View, Image} from 'react-native';

//profile uri => file://pathtoimage.jpg
//avatar uri => avatar://avatar_id
export function GenericAvatar({
  avatarSize,
  profileUri,
}: {
  avatarSize: string; //size - extraSmall, small, medium, large || default - large
  profileUri: string;
}) {
  //extract avatar id from profileUri
  const avatarId =
    profileUri.substring(0, 9) === 'avatar://'
      ? profileUri.replace('avatar://', '')
      : '0';

  // set size of avatar according to specs
  function avatarSizeStylePicker(avatarSize?: string) {
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

  // Function to retrieve Icon based on id
  const getIconById = (id: string) => {
    const avatarMappingEntry = avatarmapping.find(entry => entry.id === id);
    return avatarMappingEntry ? avatarMappingEntry.Icon : null;
  };

  const Icon = getIconById(avatarId);

  return (
    <View
      style={StyleSheet.compose(
        styles.container,
        avatarSizeStylePicker(avatarSize),
      )}>
      {profileUri && avatarId === '0' && (
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
    </View>
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
