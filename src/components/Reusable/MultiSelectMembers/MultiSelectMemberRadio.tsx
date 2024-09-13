// @sumaanta
/**
 * A multiple select member radio will be used in Port to select multiple members
 * Possible states:
 * 1. isSelected member selected
 * 2. SetIsSelected handles member selection internally
 *
 * The card takes the following props:
 * 2. memberName - will be the name of the member
 * 3. profileUri - will be generic avatar rendering the profile photo(will have default avatar)
 * 4. onSelect - will handle addition to array
 * 5. onUnselect - will handle removal to array
 */
import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {AvatarBox} from '../AvatarBox/AvatarBox';
import {PortSpacing} from '@components/ComponentUtils';
import CheckBox from '@components/Reusable/MultiSelectMembers/CheckBox';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DynamicColors from '@components/DynamicColors';

const MultiSelectMemberRadio = ({
  member,
  onUnselect,
  onSelect,
  selectedMembers,
}: {
  member: ConnectionInfo;
  selectedMembers: ConnectionInfo[];
  onUnselect: (chatId: string) => void;
  onSelect: (member: ConnectionInfo) => void;
}) => {
  const doesExist = () => {
    const output = selectedMembers.find(x => x.chatId === member.chatId);
    if (output) {
      return true;
    } else {
      return false;
    }
  };
  const [toggleCheckBox, setToggleCheckBox] = useState(doesExist());
  const Colors = DynamicColors();

  useMemo(() => {
    setToggleCheckBox(doesExist());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMembers]);

  const onCheckboxToggle = (newValue: boolean) => {
    setToggleCheckBox(newValue);
    if (newValue) {
      onSelect(member);
    } else {
      onUnselect(member.chatId);
    }
  };
  return (
    <Pressable
      onPress={() => {
        onCheckboxToggle(!toggleCheckBox);
      }}
      style={styles.container}
      //Prevents inner items from intercepting touches, all touches are handled by the parent.
      pointerEvents="box-only">
      <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
        <AvatarBox avatarSize="s" profileUri={member.pathToDisplayPic} />
        <NumberlessText
          style={styles.textBox}
          ellipsizeMode="tail"
          numberOfLines={1}
          fontSizeType={FontSizeType.m}
          fontType={FontType.rg}
          textColor={Colors.text.primary}>
          {member.name}
        </NumberlessText>
      </View>
      <CheckBox value={toggleCheckBox} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: PortSpacing.secondary.uniform,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  textBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
});

export default MultiSelectMemberRadio;
