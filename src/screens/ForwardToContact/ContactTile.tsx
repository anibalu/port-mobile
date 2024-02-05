/**
 * Default chat tile displayed when there are no connections
 */
import React, {useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import {GenericAvatar} from '@components/GenericAvatar';
import {PortColors} from '@components/ComponentUtils';
import {DEFAULT_AVATAR} from '@configs/constants';
import CheckBox from '@react-native-community/checkbox';

export default function ContactTile({
  member,
  onToggle,
}: {
  member: ConnectionInfo;
  onToggle: (member: ConnectionInfo) => void;
}) {
  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  const onCheckboxToggle = (newValue: boolean) => {
    setToggleCheckBox(newValue);
    onToggle(member);
  };

  return (
    <Pressable
      style={styles.defaultTileContainer}
      //Prevents inner items from intercepting touches, all touches are handled by the parent.
      pointerEvents="box-only"
      onPress={() => {
        onCheckboxToggle(!toggleCheckBox);
      }}>
      <GenericAvatar
        profileUri={
          member?.pathToDisplayPic ? member.pathToDisplayPic : DEFAULT_AVATAR
        }
        avatarSize={'small'}
      />
      <NumberlessText
        style={styles.defaultTileText}
        numberOfLines={1}
        fontSizeType={FontSizeType.m}
        fontType={FontType.md}>
        {' '}
        {member.name}
      </NumberlessText>
      <CheckBox value={toggleCheckBox} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  defaultTileContainer: {
    marginHorizontal: 19,

    marginBottom: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderRadius: 16,
    alignSelf: 'center',
    padding: 15,
    justifyContent: 'space-between',
    paddingRight: 21,
  },
  defaultTileText: {
    color: PortColors.primary.black,
    textAlign: 'left',
    flex: 1,
    marginLeft: 19,
    fontSize: 15,
  },
  newIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
