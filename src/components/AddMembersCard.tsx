import React, {useCallback, useMemo, useState} from 'react';
import SimpleCard from './Reusable/Cards/SimpleCard';
import {PortSpacing} from './ComponentUtils';
import {FontSizeType, FontType, NumberlessText} from './NumberlessText';
import DynamicColors from './DynamicColors';
import {Pressable, StyleSheet, View} from 'react-native';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {GroupMemberLoadedData} from '@utils/Storage/DBCalls/groupMembers';
import {AvatarBox} from './Reusable/AvatarBox/AvatarBox';
import {
  DEFAULT_GROUP_MEMBER_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
  GROUP_MEMBER_LIMIT,
} from '@configs/constants';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {GroupData} from '@utils/Storage/DBCalls/group';
import {useSelector} from 'react-redux';
import {getChatIdFromPairHash} from '@utils/Storage/connections';
import GroupMemberInfoBottomsheet from './Reusable/BottomSheets/GroupMemberInfoBottomsheet';
import Group from '@utils/Groups/Group';

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
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'Plus',
      light: require('@assets/icons/AccentPlus.svg').default,
      dark: require('@assets/icons/AccentPlus.svg').default,
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
  // const Plus = results.Plus;
  const Link = results.Link;
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

  const onCreateGroupPort = () => {
    navigation.navigate('NewGroupPort', {
      chatId: chatId,
      chatData: chatData,
    });
  };

  const onPressMember = async (member: GroupMemberLoadedData) => {
    try {
      if (member.pairHash === 'self') {
        navigation.navigate('MyProfile');
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

  return (
    <SimpleCard
      style={{
        paddingVertical: PortSpacing.secondary.uniform,
        paddingHorizontal: PortSpacing.secondary.uniform,
      }}>
      <View style={styles.headerWrapper}>
        <NumberlessText
          textColor={Colors.labels.text}
          fontType={FontType.md}
          fontSizeType={FontSizeType.l}>
          Group members
        </NumberlessText>
        <NumberlessText
          style={{
            color: Colors.labels.text,
            paddingRight: 4,
          }}
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}>
          {`${allMembers.length + 1}/${GROUP_MEMBER_LIMIT}`}
        </NumberlessText>
      </View>
      {chatData.amAdmin && (
        <>
          {/* <Pressable
            onPress={() => {
              navigation.navigate('AddNewContacts', {
                chatId: chatId,
              });
            }}
            style={StyleSheet.compose(
              {
                borderBottomWidth: 0.5,
                borderBottomColor: Colors.primary.stroke,
              },
              styles.heading,
            )}>
            <Plus height={24} width={24} />
            <NumberlessText
              style={styles.text}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}
              numberOfLines={1}
              ellipsizeMode="tail">
              Add new members from contacts
            </NumberlessText>
          </Pressable> */}
          <Pressable onPress={onCreateGroupPort} style={styles.heading}>
            <Link height={24} width={24} />
            <NumberlessText
              style={styles.text}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}
              numberOfLines={1}
              ellipsizeMode="tail">
              Add new members using a Group Port
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
                    : Colors.primary.stroke,
              })}
              onPress={() => onPressMember(member)}>
              <AvatarBox avatarSize="s" profileUri={member.displayPic} />
              <View style={styles.item}>
                <NumberlessText
                  style={{
                    color: Colors.labels.text,
                    paddingLeft: PortSpacing.secondary.left,
                  }}
                  fontType={FontType.rg}
                  fontSizeType={FontSizeType.m}>
                  {member.name || DEFAULT_GROUP_MEMBER_NAME}
                </NumberlessText>
                {member.isAdmin && (
                  <View
                    style={{
                      backgroundColor: Colors.primary.lightgrey,
                      padding: 4,
                      borderRadius: 6,
                    }}>
                    <NumberlessText
                      textColor={Colors.text.subtitle}
                      fontType={FontType.rg}
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
            navigation.navigate('AllMembers', {
              chatId: chatId,
              members: members,
              chatData: chatData,
            });
          }}
          style={styles.button}>
          <NumberlessText
            style={{
              color: Colors.labels.text,
              paddingLeft: PortSpacing.secondary.left,
            }}
            fontType={FontType.sb}
            fontSizeType={FontSizeType.l}>
            See all participants
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
    </SimpleCard>
  );
};

const styling = (Colors: any) =>
  StyleSheet.create({
    row: {
      flex: 1,
      paddingVertical: PortSpacing.tertiary.bottom,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: PortSpacing.secondary.bottom,
    },
    button: {
      flex: 1,
      marginTop: PortSpacing.secondary.top,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    heading: {
      flex: 1,
      paddingVertical: PortSpacing.secondary.bottom,
      marginBottom: PortSpacing.secondary.bottom,
      flexDirection: 'row',
      borderColor: Colors.primary.stroke,
      borderWidth: 0.5,
      paddingHorizontal: PortSpacing.secondary.top,
      borderRadius: 12,
    },
    item: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    text: {
      flex: 1,
      color: Colors.primary.tealBlue,
      paddingLeft: PortSpacing.tertiary.left,
      marginTop: 2,
    },
  });

export default AddMembersCard;
