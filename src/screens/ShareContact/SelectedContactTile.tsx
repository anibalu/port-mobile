/**
 * Default chat tile displayed when there are no connections
 */
import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import Plus from '@assets/icons/plus.svg';
import {GenericAvatar} from '@components/GenericAvatar';
import {PortColors} from '@components/ComponentUtils';
import {DEFAULT_AVATAR} from '@configs/constants';

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
          member?.pathToDisplayPic ? member.pathToDisplayPic : DEFAULT_AVATAR
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
      <NumberlessText
        fontType={FontType.rg}
        fontSizeType={FontSizeType.l}
        textColor={PortColors.primary.black}
        style={styles.defaultTileText}
        numberOfLines={1}>
        {member.name}
      </NumberlessText>
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
    textAlign: 'left',
    flex: 1,
    marginLeft: 19,
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
