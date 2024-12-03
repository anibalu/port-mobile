import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryBottomSheet from '@components/Reusable/BottomSheets/PrimaryBottomSheet';
import SimpleCard from '@components/Reusable/Cards/SimpleCard';

import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import DynamicColors from '@components/DynamicColors';
import {GroupMemberLoadedData} from '@utils/Storage/DBCalls/groupMembers';
import {
  DEFAULT_GROUP_MEMBER_NAME,
  safeModalCloseDuration,
} from '@configs/constants';
import {AvatarBox} from '../AvatarBox/AvatarBox';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {getChatTileTimestamp, wait} from '@utils/Time';
import Group from '@utils/Groups/Group';
import {ToastType, useToast} from 'src/context/ToastContext';
import {useNavigation} from '@react-navigation/native';
import DirectChat, {LineDataCombined} from '@utils/DirectChats/DirectChat';
import SmallLoader from '../Loaders/SmallLoader';
import {getChatIdFromPairHash} from '@utils/Storage/connections';
import {getContact} from '@utils/Storage/contacts';
import {ChatType} from '@utils/Storage/DBCalls/connections';

interface GroupMemberUseableData extends GroupMemberLoadedData {
  directChatId?: string | null;
}

const GroupMemberInfoBottomsheet = ({
  chatId,
  amAdmin,
  member,
  setMembers,
  visible,
  onClose,
}: {
  chatId: string;
  amAdmin: boolean;
  member: GroupMemberUseableData;
  setMembers: (x: GroupMemberLoadedData[]) => void;
  visible: boolean;
  onClose: () => void;
}) => {
  const Colors = DynamicColors();
  const {showToast} = useToast();
  const svgArray = [
    {
      assetName: 'ContactShareIcon',
      light: require('@assets/light/icons/DirectChat.svg').default,
      dark: require('@assets/dark/icons/DirectChat.svg').default,
    },
    {
      assetName: 'Admin',
      light: require('@assets/light/icons/SuperportBold.svg').default,
      dark: require('@assets/dark/icons/SuperportBold.svg').default,
    },
    {
      assetName: 'DeleteIcon',
      light: require('@assets/light/icons/Delete.svg').default,
      dark: require('@assets/dark/icons/Delete.svg').default,
    },
    {
      assetName: 'Profile',
      light: require('@assets/light/icons/ProfileIcon.svg').default,
      dark: require('@assets/dark/icons/ProfileIcon.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const ContactShareIcon = results.ContactShareIcon;
  const Admin = results.Admin;
  const DeleteIcon = results.DeleteIcon;
  const Profile = results.Profile;

  const [isRemovingMember, setIsRemovingMember] = useState<boolean>(false);
  const onRemoveMember = async () => {
    setIsRemovingMember(true);
    const chatHandler = new Group(chatId);
    try {
      await chatHandler.removeMember(member.memberId);
      setMembers(await chatHandler.getMembers());
      setIsRemovingMember(false);
      onClose();
    } catch (error) {
      console.log('Error removing member: ', error);
      setIsRemovingMember(false);
      onClose();
      await wait(safeModalCloseDuration);
      showToast(
        'Unable to remove member. Check network connection.',
        ToastType.error,
      );
    }
  };

  const [isManagingAdmin, setIsManagingAdmin] = useState<boolean>(false);
  const onAdminManagement = async () => {
    setIsManagingAdmin(true);
    const chatHandler = new Group(chatId);
    try {
      if (member.isAdmin) {
        console.log('demoting member');
        await chatHandler.demoteMember(member.memberId);
      } else {
        await chatHandler.promoteMember(member.memberId);
      }
      setMembers(await chatHandler.getMembers());
      setIsManagingAdmin(false);
      onClose();
    } catch (error) {
      console.log('Error managing admin: ', error);
      setIsManagingAdmin(false);
      onClose();
      await wait(safeModalCloseDuration);
      showToast(
        'Unable to change admin. Check network connection.',
        ToastType.error,
      );
    }
  };
  const navigation = useNavigation();
  const onChatRequestClick = async (directChatId?: string | null) => {
    if (directChatId) {
      try {
        const directChat = new DirectChat(directChatId);
        const directChatData = await directChat.getChatData();
        onClose();
        await wait(safeModalCloseDuration);
        navigation.popToTop();
        navigation.replace('HomeTab', {
          screen: 'Home',
          params: {
            initialChatType: ChatType.direct,
            chatData: {
              chatId: directChatId,
              isConnected: !directChatData.disconnected,
              profileUri: directChatData.displayPic,
              name: directChatData.name,
              isAuthenticated: directChatData.authenticated,
            },
          },
        });
        // navigation.push('DirectChat', );
      } catch (error) {
        console.error('Error navigating to direct chat: ', error);
      }
    } else {
      //send direct chat request
      onClose();
      await wait(safeModalCloseDuration);
      showToast(
        'Sending direct chat requests is not yet supported',
        ToastType.error,
      );
    }
  };

  const onGoToProfile = async (pairHash: string) => {
    //navigate to contact profile page.
    await wait(safeModalCloseDuration);
    const contact = await getContact(pairHash);

    let chatId = await getChatIdFromPairHash(pairHash);
    let chatData: LineDataCombined | null = null;
    if (chatId) {
      const chat = new DirectChat(chatId);
      chatData = await chat.getChatData();
    }

    onClose();
    navigation.push('ContactProfile', {
      chatId,
      chatData: chatData,
      contactInfo: contact,
    });
  };
  return (
    <PrimaryBottomSheet
      showClose={false}
      visible={visible}
      bgColor="g"
      onClose={onClose}>
      <View style={styles.cardWrapper}>
        <AvatarBox avatarSize="s+" profileUri={member.displayPic} />
        <View
          style={{
            paddingLeft: PortSpacing.secondary.left,
            marginTop: PortSpacing.tertiary.top,
          }}>
          <NumberlessText
            textColor={Colors.text.primary}
            fontSizeType={FontSizeType.l}
            fontType={FontType.sb}>
            {member.name || DEFAULT_GROUP_MEMBER_NAME}
          </NumberlessText>
          <NumberlessText
            textColor={Colors.text.subtitle}
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}>
            {'Member since : ' + getChatTileTimestamp(member.joinedAt)}
          </NumberlessText>
        </View>
      </View>
      <SimpleCard style={styles.item}>
        <Pressable
          style={StyleSheet.compose(styles.row, {
            borderBottomColor: Colors.primary.stroke,
            borderBottomWidth: 0.5,
          })}
          onPress={() => onGoToProfile(member.pairHash)}>
          <NumberlessText
            textColor={Colors.text.primary}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            View contact
          </NumberlessText>
          <Profile width={20} height={20} />
        </Pressable>
        <Pressable
          style={StyleSheet.compose(styles.row, {
            borderBottomColor: Colors.primary.stroke,
            borderBottomWidth: 0.5,
          })}
          onPress={() => onChatRequestClick(member.directChatId)}>
          <NumberlessText
            textColor={Colors.text.primary}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            {member.directChatId ? 'Go to chat' : 'Request to form chat'}
          </NumberlessText>
          <ContactShareIcon width={20} height={20} />
        </Pressable>

        {amAdmin && (
          <>
            <Pressable
              style={StyleSheet.compose(styles.row, {
                borderBottomColor: Colors.primary.stroke,
                borderBottomWidth: 0.5,
              })}
              onPress={onAdminManagement}>
              <NumberlessText
                textColor={Colors.text.primary}
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                {member.isAdmin ? 'Dismiss as admin' : 'Make group admin'}
              </NumberlessText>
              {!isManagingAdmin ? (
                <Admin width={20} height={20} />
              ) : (
                <SmallLoader size={20} />
              )}
            </Pressable>
            <Pressable style={styles.row} onPress={onRemoveMember}>
              <NumberlessText
                textColor={Colors.primary.red}
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                Remove member
              </NumberlessText>
              {!isRemovingMember ? (
                <DeleteIcon width={20} height={20} />
              ) : (
                <SmallLoader size={20} />
              )}
            </Pressable>
          </>
        )}
      </SimpleCard>
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: PortSpacing.tertiary.uniform,
    ...(isIOS ? {marginBottom: PortSpacing.secondary.bottom} : 0),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: PortSpacing.secondary.uniform,
  },
  item: {
    width: screen.width - 32,
    paddingHorizontal: PortSpacing.secondary.uniform,
    marginHorizontal: PortSpacing.secondary.uniform,
    paddingVertical: PortSpacing.secondary.uniform,
  },
});

export default GroupMemberInfoBottomsheet;
