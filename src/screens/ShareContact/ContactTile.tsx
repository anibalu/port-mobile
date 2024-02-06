/**
 * Default chat tile displayed when there are no connections
 */
import React from 'react';
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
import {RadioButton} from '@screens/BugReporting/AccordionWithRadio';

export default function ContactTile({
  member,
  setSelectedMembers,
  selectedMembers,
}: {
  member: ConnectionInfo;
  setSelectedMembers: () => void;
  selectedMembers: ConnectionInfo;
}) {
  const onCheckboxToggle = () => {
    setSelectedMembers(member);
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
      <NumberlessText
        fontType={FontType.md}
        fontSizeType={FontSizeType.m}
        textColor={PortColors.primary.black}
        style={styles.defaultTileText}
        numberOfLines={1}>
        {member.name}
      </NumberlessText>
      <RadioButton selected={selectedMembers?.chatId === member.chatId} />
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
    textAlign: 'left',
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
