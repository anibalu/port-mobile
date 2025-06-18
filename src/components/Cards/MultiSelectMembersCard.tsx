import React from 'react';
import { FlatList, View } from 'react-native';

import GradientCard from '@components/Cards/GradientCard';
import { useColors } from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import SelectMemberRadio from '@components/Reusable/MultiSelectMembers/SelectMemberRadio';
import { Spacing } from '@components/spacingGuide';

import { ConnectionInfo } from '@utils/Storage/DBCalls/connections';


const MultiSelectMembersCard = ({
  members,
  setSelectedMembers,
  selectedMembers, 
}: {
  members: ConnectionInfo[];
  setSelectedMembers: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedMembers: Set<string>;
}) => {


  const Colors = useColors();

  const onSelect = (chatId: string) => {
    const newSet = new Set(selectedMembers);
    newSet.add(chatId);
    setSelectedMembers(newSet);
  };
  const onUnselect = (chatId: string) => {
    const newSet = new Set(selectedMembers);
    newSet.delete(chatId);
    setSelectedMembers(newSet);
  };

  const renderMember = ({ item, index }: { item: ConnectionInfo, index: number }) => {
    return (
      <View>
        <SelectMemberRadio
         selected={selectedMembers.has(item.chatId)} 
          onUnselect={onUnselect}
          onSelect={onSelect}
          member={item}
          addSeparator={members.length - 1 !== index}
        />
      </View>
    );
  };


  return (
    <View style={{ paddingBottom: members.length > 10 ? Spacing.xxl : 300 }}>
      <GradientCard style={{ paddingHorizontal: Spacing.l }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={members}
          renderItem={renderMember}
          keyExtractor={item => item.chatId}
          keyboardShouldPersistTaps={'handled'}
          ListEmptyComponent={() => (
            <View
              style={{
                height: 100,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <NumberlessText
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.l}
                fontWeight={FontWeight.rg}>
                No Port Contacts found
              </NumberlessText>
            </View>
          )}
        />
      </GradientCard>

    </View>
  );
};

export default MultiSelectMembersCard;
