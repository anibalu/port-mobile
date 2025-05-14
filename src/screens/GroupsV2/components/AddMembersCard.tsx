import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import {
  DEFAULT_GROUP_MEMBER_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  GROUP_MEMBER_LIMIT,
} from '@configs/constants';

import Group from '@utils/Groups/GroupClass';
import {getChatIdFromPairHash} from '@utils/Storage/connections';
import {GroupData} from '@utils/Storage/DBCalls/group';
import {GroupMemberLoadedData} from '@utils/Storage/DBCalls/groupMembers';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import GradientCard from '../../../components/Cards/GradientCard';
import { useColors } from '../../../components/colorGuide';
import {FontSizeType,  FontWeight, NumberlessText} from '../../../components/NumberlessText';
import {AvatarBox} from '../../../components/Reusable/AvatarBox/AvatarBox';
import GroupMemberInfoBottomsheet from '../../../components/Reusable/BottomSheets/GroupMemberInfoBottomsheet';
import { Spacing } from '../../../components/spacingGuide';


interface GroupMemberUseableData extends GroupMemberLoadedData {
  directChatId?: string | null;
}
const AddMembersCard = ({
  members,
  chatId,
  chatData,
}: {
  members: GroupMemberLoadedData[];
  chatId: string;
  chatData: GroupData;
}) => {
  const profile = useSelector(state => state.profile.profile);
  const {name, avatar} = useMemo(() => {
    return {
      name: 'You',
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);
  const [selectedMember, setSelectedMember] =
    useState<GroupMemberUseableData | null>(null);
  const [allMembers, setAllMembers] =
    useState<GroupMemberLoadedData[]>(members);
  const Colors = useColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'Plus',
      light: require('@assets/light/icons/Plus.svg').default,
      dark: require('@assets/dark/icons/Plus.svg').default,
    },
    {
      assetName: 'Link',
      light: require('@assets/light/icons/Link.svg').default,
      dark: require('@assets/dark/icons/Link.svg').default,
    },
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const navigation = useNavigation();
  const Plus = results.Plus;
  const AngleRight = results.AngleRight;

  const [modifiedMembers, setModifedMembers] = useState<
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



  const onPressMember = async (member: GroupMemberLoadedData) => {
    try {
      if (member.pairHash === 'self') {
        /**
         * The stack can currently be of any height, but it is not on the profile tab.
         * To make the stach logical, we must move the user onto the MyProfile screen, and not
         * have any back action.
         * Upon clicking on either the home tab or folder tab, they start from scratch, making
         * sure that the stack doesn't end up having any cycles or weird behaviour
         */
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeTab', params: { screen: 'Settings' } }],
        })
      } else {
        const directChatId = await getChatIdFromPairHash(member.pairHash);
        setSelectedMember({...member, directChatId});
      }
    } catch (error) {
      console.error('Error navigating to member contact profile: ', error);
    }
  };

  useMemo(() => {
    setModifedMembers([
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
    // eslint-disable-next-line
  }, [chatData, allMembers]);

  /**
   * Effect to refresh group members
   */
  useFocusEffect(
    useCallback(() => {
      const fetchMembers = async () => {
        try {
          const groupHandler = await Group.load(chatId);
          const groupMembers = groupHandler.getGroupMembers();
          setAllMembers(groupMembers);
        } catch (error) {
          console.error('Error in loading group members: ', error);
        }
      };
      fetchMembers();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <GradientCard
      style={{
        paddingVertical: Spacing.l,
        paddingHorizontal: Spacing.l,
      }}>
      <View style={styles.headerWrapper}>
        <NumberlessText
          textColor={Colors.text.title}
          fontWeight={FontWeight.md}
          fontSizeType={FontSizeType.l}>
          Group members
        </NumberlessText>
        <NumberlessText
          style={{
            color: Colors.text.title,
            paddingRight: 4,
          }}
          fontWeight={FontWeight.rg}
          fontSizeType={FontSizeType.m}>
          {`${allMembers.length + 1}/${GROUP_MEMBER_LIMIT}`}
        </NumberlessText>
      </View>
      {chatData.amAdmin && (
        <>
          <Pressable onPress={()=>(navigation as any).navigate('InviteGroupMembers', {
            chatId: chatId, groupData: chatData
          })} style={styles.heading}>
            <Plus height={24} width={24} />
            <NumberlessText
              style={styles.text}
              fontWeight={FontWeight.rg}
              fontSizeType={FontSizeType.m}
              numberOfLines={1}
              ellipsizeMode="tail">
              Invite new members
            </NumberlessText>
          </Pressable>
        </>
      )}
      <View>
        {modifiedMembers.slice(0, 4).map((member, index) => {
          return (
            <Pressable
              key={member.memberId}
              style={StyleSheet.compose(styles.row, {
                borderBottomWidth: 0.5,
                borderBottomColor:
                  modifiedMembers.length - 1 === index
                    ? 'transparent'
                    : Colors.stroke,
              })}
              onPress={() => onPressMember(member)}>
              <AvatarBox avatarSize="s" profileUri={member.displayPic} />
              <View style={styles.item}>
                <NumberlessText
                  style={{
                    color: Colors.text.title,
                    paddingLeft: Spacing.l,
                  }}
                  fontWeight={FontWeight.rg}
                  fontSizeType={FontSizeType.m}>
                  {member.name || DEFAULT_GROUP_MEMBER_NAME}
                </NumberlessText>
                {member.isAdmin && (
                  <View
                    style={{
                      backgroundColor: Colors.surface2,
                      padding: 4,
                      paddingHorizontal: Spacing.s,
                      borderRadius: Spacing.l,
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
          );
        })}
        <Pressable
          onPress={() => {
            /**
             * We push the AllMembers screen onto the stack so on navigating back, we ensure to return to
             * the group settings page
             */
            navigation.push('AllMembers', {
              chatId: chatId,
              members: members,
              chatData: chatData,
            });
          }}
          style={styles.button}>
          <NumberlessText
            style={{
              color: Colors.text.title,
              paddingLeft:Spacing.l
            }}
            fontWeight={FontWeight.sb}
            fontSizeType={FontSizeType.l}>
            See all members
          </NumberlessText>
          <AngleRight />
        </Pressable>
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
    </GradientCard>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    row: {
      flex: 1,
      paddingVertical: Spacing.s,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom:Spacing.l,
    },
    button: {
      flex: 1,
      marginTop: Spacing.l,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    heading: {
      flex: 1,
      paddingVertical: Spacing.l,
      marginBottom: Spacing.l,
      flexDirection: 'row',
      borderColor: Colors.stroke,
      borderWidth: 0.5,
      paddingHorizontal: Spacing.l,
      borderRadius: 12,
    },
    item: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    text: {
      flex: 1,
      color: Colors.text.title,
      paddingLeft:Spacing.s,
      marginTop: 4,
    },
  });

export default AddMembersCard;
