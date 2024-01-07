/**
 * Default chat tile displayed when there are no connections
 */
import React, {useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {NumberlessMediumText} from '@components/NumberlessText';
import CheckBox from '@react-native-community/checkbox';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import {GenericAvatar} from '@components/GenericAvatar';
import {PortColors} from '@components/ComponentUtils';
import {DEFAULT_AVATAR} from '@configs/constants';

export default function ContactTile({
  member,
  onToggle,
}: {
  member: ConnectionInfo;
  onToggle: (member: ConnectionInfo) => boolean;
}) {
  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  const onCheckboxToggle = () => {
    setToggleCheckBox(onToggle(member));
  };

  return (
    <Pressable
      style={styles.defaultTileContainer}
      pointerEvents="box-only"
      onPress={onCheckboxToggle}>
      <GenericAvatar
        profileUri={
          member?.pathToDisplayPic ? member.pathToDisplayPic : DEFAULT_AVATAR
        }
        avatarSize={'small'}
      />
      <NumberlessMediumText style={styles.defaultTileText} numberOfLines={1}>
        {member.name}
      </NumberlessMediumText>
      <CheckBox value={toggleCheckBox} />
    </Pressable>
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
  newIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
