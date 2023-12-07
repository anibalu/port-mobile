/**
 * Default chat tile displayed when there are no connections
 */
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {NumberlessRegularText} from '@components/NumberlessText';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import Plus from '@assets/icons/plus.svg';
import {GenericAvatar} from '@components/GenericAvatar';
import {PortColors} from '@components/ComponentUtils';

export default function SelectedContactTile({
  member,
  onRemove,
}: {
  member: ConnectionInfo;
  onRemove: (member: ConnectionInfo) => void;
}) {
  return (
    <View style={styles.defaultTileContainer}>
      <GenericAvatar
        profileUri={
          member?.pathToDisplayPic ? member.pathToDisplayPic : 'avatar://1'
        }
        avatarSize={'small'}
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
    width: '90%',
    marginBottom: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderRadius: 16,
    left: 19,
    padding: 15,
    justifyContent: 'space-between',
  },
  defaultTileText: {
    color: PortColors.primary.black,
    textAlign: 'left',
    flex: 1,
    marginLeft: 19,
    fontSize: 17,
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
