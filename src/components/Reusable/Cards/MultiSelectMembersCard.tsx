// @sumaanta
/**
 * A multi select members card component will be used in Port to display a list of members in a card
 *
 * The component takes the following props:
 * 1. members - all the members available in a chat of type ConnectionInfo
 * 2. selectedMembers - all selected members
 * 3. setSelectedMembers - handles selection and unselection of members
 */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import SimpleCard from './SimpleCard';
import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import MultiSelectMemberRadio from '../MultiSelectMembers/MultiSelectMemberRadio';
import LineSeparator from '../Separators/LineSeparator';
import {Pressable, ScrollView, View} from 'react-native';
import {PortSpacing} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import DynamicColors from '@components/DynamicColors';
import FilterByFolderBottomSheet from '@screens/Superport/FilterByFolderBottomSheet';
import {FolderInfo} from '@utils/Storage/DBCalls/folders';
import {useFocusEffect} from '@react-navigation/native';
import {getAllFolders} from '@utils/Storage/folders';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {folderIdToHex} from '@utils/Folders/folderIdToHex';
import {SvgXml} from 'react-native-svg';
// import PurpleCheckCircle from '@assets/icons/PurpleCheckCircle.svg';
// import CheckBox from '../MultiSelectMembers/CheckBox';

const MultiSelectMembersCard = ({
  members,
  setSelectedMembers,
  selectedMembers,
  selectAll,
  setSelectAll,
}: {
  selectAll: boolean;
  setSelectAll: (p: any) => void;
  members: ConnectionInfo[];
  setSelectedMembers: (member: any) => void;
  selectedMembers: ConnectionInfo[];
}) => {
  const [openFilterByFolder, setOpenFilterByFolder] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderInfo | null>(null);
  const [foldersArray, setFoldersArray] = useState<FolderInfo[]>([]);
  const [filteredMembers, setFilteredMembers] =
    useState<ConnectionInfo[]>(members);
  console.log('selectAll', selectAll);

  const Colors = DynamicColors();

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
    setSelectAll(false);
  };

  // commenting out select all logic untill we put optimised approach

  // const onSelectAll = () => {
  //   setSelectAll(p => !p);
  //   setSelectedMembers(selectAll ? [] : filteredMembers);
  // };
  // useMemo(() => {
  //   // Check if all members are selected
  //   const areAllMembersSelected =
  //     selectedMembers.length === filteredMembers.length;

  //   // Compare selected and filtered members
  //   const areMembersIdentical =
  //     JSON.stringify(selectedMembers) === JSON.stringify(filteredMembers);

  //   // Check if any selected member is in the filtered list
  //   const areSomeMembersSelected = filteredMembers.some(member =>
  //     selectedMembers.includes(member),
  //   );

  //   // Determine the value for selectAll
  //   const shouldSelectAll = areAllMembersSelected
  //     ? areMembersIdentical
  //     : areSomeMembersSelected;

  //   // Update the selectAll state
  //   setSelectAll(shouldSelectAll);

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [filteredMembers, selectedMembers]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const fetchedFolders = await getAllFolders();
          setFoldersArray(fetchedFolders);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      })();
    }, []),
  );

  useEffect(() => {
    (async () => {
      if (selectedFolder) {
        const folderFilteredMembers = members.filter(
          member => member.folderId === selectedFolder.folderId,
        );
        setFilteredMembers(folderFilteredMembers);
      } else {
        setFilteredMembers(members); // Set back to all members if no folder is selected
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder]);

  const svgArray = [
    {
      assetName: 'FilterFunnelIcon',
      light: require('@assets/light/icons/FilterFunnel.svg').default,
      dark: require('@assets/dark/icons/FilterFunnel.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const FilterFunnelIcon = results.FilterFunnelIcon;

  const getSvgXml = (color: string) => {
    return `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.50065 1.75H15.5007C16.4173 1.75 17.1673 2.5 17.1673 3.41667V5.25C17.1673 5.91667 16.7507 6.75 16.334 7.16667L12.7507 10.3333C12.2507 10.75 11.9173 11.5833 11.9173 12.25V15.8333C11.9173 16.3333 11.584 17 11.1673 17.25L10.0007 18C8.91732 18.6667 7.41732 17.9167 7.41732 16.5833V12.1667C7.41732 11.5833 7.08398 10.8333 6.75065 10.4167L3.58398 7.08333C3.16732 6.66667 2.83398 5.91667 2.83398 5.41667V3.5C2.83398 2.5 3.58398 1.75 4.50065 1.75Z" stroke=${color} stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.10833 1.75L5 8.33333" stroke=${color} stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
  };

  const folderColor = useMemo(
    () =>
      selectedFolder &&
      folderIdToHex(selectedFolder.folderId, Colors.boldAccentColors),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedFolder],
  );

  const memberList = filteredMembers;

  return (
    <View style={{flex: 1}}>
      <View
        style={{
          margin: PortSpacing.secondary.uniform,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Pressable
          onPress={() => setOpenFilterByFolder(true)}
          style={{
            backgroundColor: Colors.primary.surface,
            paddingHorizontal: PortSpacing.tertiary.uniform,
            paddingVertical: 10,
            borderRadius: PortSpacing.tertiary.uniform,
            borderWidth: 0.5,
            borderColor: Colors.primary.stroke,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}>
          {selectedFolder === null ? (
            <FilterFunnelIcon width={20} height={20} />
          ) : (
            <SvgXml
              xml={getSvgXml(folderColor ? folderColor : Colors.text.primary)}
            />
          )}
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}
            textColor={folderColor ? folderColor : Colors.text.primary}>
            {selectedFolder && selectedFolder.folderId !== 'all'
              ? selectedFolder.name
              : 'Filter by folder'}
          </NumberlessText>
        </Pressable>

        {/* commenting out below select all logic untill we put optimised approach */}
        {/* {filteredMembers.length > 0 && (
          <Pressable
            onPress={onSelectAll}
            style={{
              backgroundColor: Colors.primary.surface,
              paddingHorizontal: PortSpacing.tertiary.uniform,
              paddingVertical: 10,
              borderRadius: PortSpacing.tertiary.uniform,
              borderWidth: 0.5,
              borderColor: Colors.primary.stroke,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}
              textColor={Colors.text.primary}>
              {selectAll ? 'Unselect all' : 'Select all'}
            </NumberlessText>
            {selectAll ? (
              <CheckBox value={true} />
            ) : (
              <PurpleCheckCircle height={22} width={22} />
            )}
          </Pressable>
        )} */}
      </View>
      <SimpleCard
        style={{
          flex: 1,
          overflow: 'scroll',
          marginHorizontal: PortSpacing.secondary.uniform,
        }}>
        {memberList.length > 0 ? (
          <ScrollView horizontal={false} showsHorizontalScrollIndicator={false}>
            {memberList.map((member, index) => {
              return (
                <View key={member.chatId}>
                  <MultiSelectMemberRadio
                    selectedMembers={selectedMembers}
                    onUnselect={onUnselect}
                    onSelect={onSelect}
                    member={member}
                  />
                  {memberList.length - 1 !== index && <LineSeparator />}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View
            style={{
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <NumberlessText
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              No chats available
            </NumberlessText>
          </View>
        )}
      </SimpleCard>
      <FilterByFolderBottomSheet
        title={'Filter by folder'}
        currentFolder={
          selectedFolder
            ? selectedFolder
            : {name: 'All Chats', folderId: 'all', permissionsId: 'all'}
        }
        foldersArray={[
          {name: 'All Chats', folderId: 'all', permissionsId: 'all'},
          ...foldersArray,
        ]}
        onClose={() => setOpenFilterByFolder(false)}
        setSelectedFolderData={setSelectedFolder}
        visible={openFilterByFolder}
      />
    </View>
  );
};

export default MultiSelectMembersCard;
