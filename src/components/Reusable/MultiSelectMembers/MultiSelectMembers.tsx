// @sumaanta
/**
 * A multi select members component will be used in Port to display selected members from a list of members
 *
 * The component takes the following props:
 * 1. members - all the members available in a chat of type ConnectionInfo
 * 2. selectedMembers - all selected members
 * 3. setSelectedMembers - handles selection and unselection of members
 */

import React from 'react';
import {View} from 'react-native';
import ClickableTextWithAvatar from './ClickableTextWithAvatar';
import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import MultiSelectMembersCard from '../Cards/MultiSelectMembersCard';

const MultiSelectMembers = ({
  members,
  setSelectedMembers,
  selectedMembers,
}: {
  members: ConnectionInfo[];
  setSelectedMembers: (member: any) => void;
  selectedMembers: ConnectionInfo[];
}) => {
  return (
    <View style={{marginTop: 8}}>
      {selectedMembers.length > 0 && (
        <ClickableTextWithAvatar
          setSelectedMembers={setSelectedMembers}
          selectedMembers={selectedMembers}
        />
      )}
      {members.length > 0 && (
        <MultiSelectMembersCard
          setSelectedMembers={setSelectedMembers}
          members={members}
          selectedMembers={selectedMembers}
        />
      )}
    </View>
  );
};

export default MultiSelectMembers;
