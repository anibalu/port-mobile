// @sumaanta
/**
 * A multi select members component will be used in Port to display selected members from a list of members
 *
 * The component takes the following props:
 * 1. members - all the members available in a chat of type ConnectionInfo
 * 2. selectedMembers - all selected members
 * 3. setSelectedMembers - handles selection and unselection of members
 */

import React, {useState} from 'react';
import {View} from 'react-native';

import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';

import MultiSelectMembersCard from '../Cards/MultiSelectMembersCard';

import ClickableTextWithAvatar from './ClickableTextWithAvatar';


const MultiSelectMembers = ({
  members,
  setSelectedMembers,
  selectedMembers,
  showBackgroundColor = true,
}: {
  members: ConnectionInfo[];
  setSelectedMembers: (member: any) => void;
  selectedMembers: ConnectionInfo[];
  showBackgroundColor?: boolean;
}) => {
  const [selectAll, setSelectAll] = useState(false);
  return (
    <View style={{flex: 1}}>
      {selectedMembers.length > 0 && (
        <ClickableTextWithAvatar
          showBackgroundColor={showBackgroundColor}
          setSelectAll={setSelectAll}
          setSelectedMembers={setSelectedMembers}
          selectedMembers={selectedMembers}
        />
      )}
      <MultiSelectMembersCard
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        setSelectedMembers={setSelectedMembers}
        members={members}
        selectedMembers={selectedMembers}
      />
    </View>
  );
};

export default MultiSelectMembers;
