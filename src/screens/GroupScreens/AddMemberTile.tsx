/**
 * Default chat tile displayed when there are no connections
 */
import React, {useState} from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import {NumberlessMediumText} from '@components/NumberlessText';
import CheckBox from '@react-native-community/checkbox';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import DefaultImage from '@assets/avatars/avatar.png';

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
    <Pressable style={styles.defaultTileContainer} onPress={onCheckboxToggle}>
      <Image
        source={{
          uri: member?.pathToDisplayPic
            ? member.pathToDisplayPic
            : Image.resolveAssetSource(DefaultImage).uri,
        }}
        style={styles.newIcon}
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
    color: '#18191F',
    marginTop: 12,
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

export default AddMemberTile;
