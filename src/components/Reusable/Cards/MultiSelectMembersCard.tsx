// @sumaanta
/**
 * A multi select members card component will be used in Port to display a list of members in a card
 *
 * The component takes the following props:
 * 1. members - all the members available in a chat of type ConnectionInfo
 * 2. selectedMembers - all selected members
 * 3. setSelectedMembers - handles selection and unselection of members
 */
import React from 'react';
import SimpleCard from './SimpleCard';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import MultiSelectMemberRadio from '../MultiSelectMembers/MultiSelectMemberRadio';
import LineSeparator from '../Separators/LineSeparator';
import {View} from 'react-native';
import {PortSpacing} from '@components/ComponentUtils';

const MultiSelectMembersCard = ({
  members,
  setSelectedMembers,
  selectedMembers,
}: {
  members: ConnectionInfo[];
  setSelectedMembers: (member: any) => void;
  selectedMembers: ConnectionInfo[];
}) => {
  const onSelect = (member: ConnectionInfo) => {
    if (selectedMembers.length > 0) {
      setSelectedMembers(p => [...p, member]);
    } else {
      setSelectedMembers([member]);
    }
  };
  const onUnselect = (chatId: string) => {
    setSelectedMembers(
      selectedMembers.filter(member => member.chatId !== chatId),
    );
  };
  return (
    <SimpleCard style={{marginTop: PortSpacing.secondary.top}}>
      {members.map((member, index) => {
        return (
          <View key={member.chatId}>
            <MultiSelectMemberRadio
              selectedMembers={selectedMembers}
              onUnselect={onUnselect}
              onSelect={onSelect}
              member={member}
            />
            {members.length - 1 !== index && <LineSeparator />}
          </View>
        );
      })}
    </SimpleCard>
  );
};

export default MultiSelectMembersCard;
