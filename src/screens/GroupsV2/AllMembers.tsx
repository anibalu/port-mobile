import React, {ReactElement, useCallback, useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';

import { screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import GroupMemberInfoBottomsheet from '@components/Reusable/BottomSheets/GroupMemberInfoBottomsheet';
import SimpleTopbar from '@components/Reusable/TopBars/SimpleTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import { Spacing } from '@components/spacingGuide';
import useSVG from '@components/svgGuide';

import {
  DEFAULT_GROUP_MEMBER_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
} from '@configs/constants';

import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';

import Group from '@utils/Groups/Group';
import {getChatIdFromPairHash} from '@utils/Storage/connections';
import {GroupMemberLoadedData} from '@utils/Storage/DBCalls/groupMembers';

type Props = NativeStackScreenProps<AppStackParamList, 'AllMembers'>;

interface GroupMemberUseableData extends GroupMemberLoadedData {
  directChatId?: string | null;
}

const AllMembers = ({route, navigation}: Props) => {
  const {chatId, members, chatData} = route.params;
  const profile = useSelector(state => state.profile.profile);
  const {name, avatar} = useMemo(() => {
    return {
      name: 'You',
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);

  const [allMembers, setAllMembers] =
    useState<GroupMemberLoadedData[]>(members);
  const [viewableMembers, setViewableMembers] = useState<
    GroupMemberLoadedData[]
  >([
    {
      name: name,
      displayPic: avatar.fileUri,
      isAdmin: chatData.amAdmin,
      memberId: 'self',
      pairHash: 'self',
      joinedAt: chatData.joinedAt,
      cryptoId: 'self',
      deleted: chatData.disconnected,
    },
    ...allMembers,
  ]);
  const [selectedMember, setSelectedMember] =
    useState<GroupMemberUseableData | null>(null);
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'BackIcon',
      light: require('@assets/light/icons/navigation/BlackArrowLeftThin.svg')
        .default,
      dark: require('@assets/dark/icons/navigation/BlackArrowLeftThin.svg')
        .default,
    },
  ];
  const results = useSVG(svgArray);
  const BackIcon = results.BackIcon;

  useMemo(() => {
      const filteredData = [
        {
          name: name,
          displayPic: avatar.fileUri,
          isAdmin: chatData.amAdmin,
          memberId: 'self',
          pairHash: 'self',
          joinedAt: chatData.joinedAt,
          cryptoId: 'self',
          deleted: chatData.disconnected,
        },
        ...allMembers,
      ];
      setViewableMembers(filteredData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMembers]);

  /**
   * Effect to refresh group members
   */
  useFocusEffect(
    useCallback(() => {
      const fetchMembers = async () => {
        try {
          const groupHandler = new Group(chatId);
          const groupMembers = await groupHandler.getMembers();
          setAllMembers(groupMembers);
        } catch (error) {
          console.error('Error in loading group members: ', error);
        }
      };
      fetchMembers();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  function renderMemberTile({
    item,
    index,
  }: {
    item: GroupMemberLoadedData;
    index: number;
  }): ReactElement {
    return (
      <>
        <Pressable
          onPress={async () => {
            if (item.memberId && item.memberId !== 'self') {
              const directChatId = await getChatIdFromPairHash(item.pairHash);
              setSelectedMember({...item, directChatId});
            } else if (item.memberId && item.memberId === 'self') {
              navigation.reset({
                index: 0,
                routes: [{ name: 'HomeTab', params: { screen: 'Settings' } }],
              })
            }
          }}
          style={StyleSheet.compose(styles.row, {
            borderBottomWidth: 0.5,
            borderBottomColor:
            viewableMembers.length - 1 === index
                ? 'transparent'
                : Colors.primary.stroke,
          })}>
          <AvatarBox avatarSize="s" profileUri={item.displayPic} />
          <View style={styles.item}>
            <NumberlessText
              style={{
                color: Colors.labels.text,
                paddingLeft: Spacing.l,
              }}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.m}>
              {item.name || DEFAULT_GROUP_MEMBER_NAME}
            </NumberlessText>
            {item.isAdmin && (
              <View
                style={{
                  backgroundColor: Colors.primary.lightgrey,
                  padding: 4,
                  borderRadius: 6,
                }}>
                <NumberlessText
                  textColor={Colors.text.subtitle}
                  fontWeight={FontWeight.rg}

                  fontSizeType={FontSizeType.m}>
                  Admin
                </NumberlessText>
              </View>
            )}
          </View>
        </Pressable>
      </>
    );
  }

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={styles.screen}>
        <SimpleTopbar
          IconLeft={BackIcon}
          onIconLeftPress={() => navigation.goBack()}
          heading={'See all members'}
        />
        <View style={{marginTop: Spacing.l}}>
          <FlatList
            data={viewableMembers}
            keyExtractor={item => item.memberId}
            renderItem={renderMemberTile}
            style={styles.contactListContainer}
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
                  fontWeight={FontWeight.rg}
             >
                  No matching members found
                </NumberlessText>
              </View>
            )}
          />
        </View>
        {selectedMember && (
          <GroupMemberInfoBottomsheet
            chatId={chatId}
            amAdmin={chatData.amAdmin}
            member={selectedMember}
            setMembers={setAllMembers}
            onClose={() => setSelectedMember(null)}
            visible={selectedMember ? true : false}
          />
        )}
      </SafeAreaView>
    </>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      alignSelf: 'center',
      justifyContent: 'flex-start',
      width: screen.width,
      backgroundColor: color.primary.background,
    },
    contactListContainer: {
      borderWidth: 0.5,
      backgroundColor: color.primary.surface,
      borderColor: color.primary.stroke,
      marginHorizontal: Spacing.s,
      borderRadius: Spacing.l,
      paddingHorizontal:Spacing.l,
      paddingVertical:Spacing.l,
    },
    card: {
      marginVertical: Spacing.l,
      marginHorizontal: Spacing.l,
      paddingHorizontal: Spacing.l,
    },
    scrollViewContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    barWrapper: {
      paddingHorizontal: Spacing.l,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: color.primary.surface,
      paddingVertical: Spacing.s,
    },
    search: {
      backgroundColor: color.primary.surface2,
      width: '100%',
      flexDirection: 'row',
      height: 44,
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: Spacing.s,
    },
    row: {
      paddingVertical: Spacing.s,
      flexDirection: 'row',
      alignItems: 'center',
    },
    item: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
export default AllMembers;
