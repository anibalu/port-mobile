import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {useColors} from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import CheckBox from '@components/Reusable/MultiSelectMembers/CheckBox';
import {Height} from '@components/spacingGuide';

import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';

import {AvatarBox} from '../AvatarBox/AvatarBox';

const SelectMemberRadio = ({
  member,
  onUnselect,
  onSelect,
  addSeparator,
  selected, 
}: {
  member: ConnectionInfo;
  onUnselect: (chatId: string) => void;
  onSelect: (chatId: string) => void;
  addSeparator: boolean;
  selected: boolean; 
}) => {
  const Colors = useColors();

  const onCheckboxToggle = () => {
    if (selected) {
      onUnselect(member.chatId);
    } else {
      onSelect(member.chatId);
    }
  };

  return (
    <Pressable
      onPress={onCheckboxToggle}
      style={StyleSheet.compose(styles.container, {
        borderBottomWidth: addSeparator ? 0.5 : 0,
        borderBottomColor: Colors.stroke,
      })}
      pointerEvents="box-only">
      <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
        <AvatarBox avatarSize="s" profileUri={member.pathToDisplayPic} />
        <NumberlessText
          style={styles.textBox}
          ellipsizeMode="tail"
          numberOfLines={1}
          fontSizeType={FontSizeType.m}
          fontWeight={FontWeight.rg}
          textColor={Colors.text.title}>
          {member.name}
        </NumberlessText>
      </View>
      <CheckBox value={selected} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Height.memberOptionBar,
  },
  textBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
});

export default SelectMemberRadio;
