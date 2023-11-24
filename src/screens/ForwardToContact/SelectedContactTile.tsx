/**
 * Default chat tile displayed when there are no connections
 */
import React from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {NumberlessRegularText} from '../../components/NumberlessText';
import DefaultImage from '../../../assets/avatars/avatar.png';
import {ConnectionInfo} from '../../utils/Connections/interfaces';
import Plus from '../../../assets/icons/plus.svg';

export default function SelectedContactTile({
  member,
  onRemove,
}: {
  member: ConnectionInfo;
  onRemove: (member: ConnectionInfo) => void;
}) {
  return (
    <View style={styles.defaultTileContainer}>
      <Image
        source={{
          uri: member?.pathToDisplayPic
            ? member.pathToDisplayPic
            : Image.resolveAssetSource(DefaultImage).uri,
        }}
        style={styles.profileIcon}
      />
      <Pressable
        onPress={() => {
          onRemove(member);
        }}
        style={styles.plusIcon}>
        <Plus style={{transform: [{rotate: '45deg'}]}} />
      </Pressable>
      <NumberlessRegularText style={styles.defaultTileText} numberOfLines={1}>
        {member.name}
      </NumberlessRegularText>
    </View>
  );
}

const styles = StyleSheet.create({
  defaultTileContainer: {
    width: 65,
    height: 100,
    marginVertical: 8,
    marginRight: 21,
    alignItems: 'center',
    flexDirection: 'column',
    borderRadius: 16,
    justifyContent: 'center',
  },
  defaultTileText: {
    color: '#18191F',
    marginTop: 12,
    fontSize: 18,
  },
  plusIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#A1A1A1',
    opacity: 0.5,
    borderRadius: 20,
  },
  profileIcon: {
    width: 54,
    height: 54,
    borderRadius: 11,
    overflow: 'hidden',
  },
});
