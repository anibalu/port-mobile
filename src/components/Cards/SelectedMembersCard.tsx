import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'

import { useColors } from '@components/colorGuide'
import { FontSizeType, FontWeight, NumberlessText } from '@components/NumberlessText'
import { AvatarBox } from '@components/Reusable/AvatarBox/AvatarBox'
import { Spacing } from '@components/spacingGuide'
import useSVG from '@components/svgGuide'

import { getConnection } from '@utils/Storage/connections'
import { ConnectionInfo } from '@utils/Storage/DBCalls/connections'

const SelectedMembersCard = ({members, setSelectedMembers}:{members : Set<string>;
    setSelectedMembers: React.Dispatch<React.SetStateAction<Set<string>>>;}) => {
    const Colors = useColors()
    const [memberInfoList, setMemberInfoList] = useState<ConnectionInfo[]>([]);

    const styles = styling(Colors)
    const svgArray = [
        
        {
          assetName: 'Cross',
          dark: require('@assets/dark/icons/Cross.svg').default,
          light: require('@assets/light/icons/Cross.svg').default,
        },
      ];
      const results = useSVG(svgArray);
      const Cross = results.Cross;
      const onUnselect = (chatId: string) => {
        const newSet = new Set(members);
        newSet.delete(chatId);
        setSelectedMembers(newSet);
      };


      const getSelectedConnections = async (chatIds: Set<string>) => {
        const connections = await Promise.all(
          Array.from(chatIds).map(async (chatId) => {
            try {
              return await getConnection(chatId);
            } catch (err) {
              console.error(`Failed to load ${chatId}`, err);
              return null;
            }
          })
        );
        return connections.filter((c): c is ConnectionInfo => c !== null);
      };

      useEffect(() => {
        if (members.size > 0) {
          getSelectedConnections(members).then(setMemberInfoList);
        } else {
          setMemberInfoList([]);
        }
      }, [members]);

    const renderItem = ({ item }: { item: ConnectionInfo }) => (
        <View style={styles.item}>
          <AvatarBox avatarSize='es' profileUri={item.pathToDisplayPic} />
          <NumberlessText
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.l}
                fontWeight={FontWeight.rg}>
                {item.name}
          </NumberlessText>
          <Cross height={17} width={17} onPress={()=> onUnselect(item.chatId)} />
        </View>
      );
    
  return (
    <>
    {memberInfoList.length > 0 && (
        <FlatList
          horizontal
          data={memberInfoList}
          keyExtractor={(item) => item.chatId}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.container}
        />
    )}
  </>
  )
}

const styling = (Colors: any)=> StyleSheet.create({
    container: {
        gap: Spacing.s,
      },
      item: {
        flexDirection:'row',
        backgroundColor: Colors.surface2,
        gap: Spacing.s,
        borderRadius: Spacing.xl,
        paddingHorizontal: Spacing.s,
        paddingVertical: Spacing.s,
        alignItems:'center',
        borderColor: Colors.stroke,
        borderWidth: 0.5
      },
})

export default SelectedMembersCard
