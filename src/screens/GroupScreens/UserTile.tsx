/**
 * Default chat tile displayed when there are no connections
 */
import React from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import {NumberlessRegularText} from '@components/NumberlessText';
import DefaultImage from '@assets/avatars/avatar.png';
import {GroupMember} from '@utils/Groups/interfaces';
import {DEFAULT_NAME} from '@configs/constants';

function UserTile({member}: {member: GroupMember}) {
  return (
    <Pressable style={styles.defaultTileContainer} onPress={() => {}}>
      <Image
        source={{
          uri: member?.profilePicture
            ? member.profilePicture
            : Image.resolveAssetSource(DefaultImage).uri,
        }}
        style={styles.newIcon}
      />
      <NumberlessRegularText style={styles.defaultTileText} numberOfLines={1}>
        {member?.name ? member.name : DEFAULT_NAME}
      </NumberlessRegularText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  defaultTileContainer: {
    width: 80,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultTileText: {
    color: '#8A8A8AB8',
    marginTop: 12,
  },
  newIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserTile;
