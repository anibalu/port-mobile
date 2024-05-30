/**
 * Default chat tile displayed when there are no connections
 */
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import CheckBox from '@components/Reusable/MultiSelectMembers/CheckBox';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import React, {useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';

function AddMemberTile({
  member,
  onToggle,
}: {
  member: ConnectionInfo;
  onToggle: (member: ConnectionInfo) => void;
}) {
  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  const onCheckboxToggle = () => {
    setToggleCheckBox(val => !val);
    onToggle(member);
  };

  return (
    <Pressable
      style={styles.defaultTileContainer}
      //Prevents inner items from intercepting touches, all touches are handled by the parent.
      pointerEvents="box-only"
      onPress={onCheckboxToggle}>
      <>
        <AvatarBox profileUri={member.pathToDisplayPic} avatarSize="s+" />
        <NumberlessText
          style={styles.defaultTileTextStyle}
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}>
          {member.name}
        </NumberlessText>
      </>

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
  defaultTileTextStyle: {
    flex: 1,
    marginLeft: 19,
  },
  newIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    overflow: 'hidden',
  },
});

export default AddMemberTile;
