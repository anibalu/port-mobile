/**
 * This component is responsible for showing user a particular message's reaction info.
 * It takes the following props:
 * 1. visible - visible state for bottomsheet
 * 2. chatId - string
 * 3. currentReactionMessage - array list of message id's who reacted to message (sender and receiver in DM)
 * 4. onClose - on close function for bottom sheet
 */

import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';

import {PortSpacing} from '@components/ComponentUtils';
import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';

import {DEFAULT_GROUP_MEMBER_NAME} from '@configs/constants';

import Group from '@utils/Groups/Group';
import {ContentType} from '@utils/Messaging/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {getProfilePictureUri} from '@utils/Profile';
import {GroupMemberLoadedData} from '@utils/Storage/DBCalls/groupMembers';
import {RichReaction, getRichReactions} from '@utils/Storage/reactions';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';

import {AvatarBox} from '../AvatarBox/AvatarBox';
import SimpleCard from '../Cards/SimpleCard';
import LineSeparator from '../Separators/LineSeparator';

import PrimaryBottomSheet from './PrimaryBottomSheet';

const RichGroupReactionsBottomsheet = ({
  visible,
  onClose,
  chatId,
  messageId,
}: {
  visible: boolean;
  onClose: () => void;
  chatId: string;
  currentReactionMessage: string[];
  messageId: string;
}) => {
  const [reactions, setReactions] = useState<RichReaction[]>([]);
  const [reactionCounts, setReactionCounts] = useState<
    {reaction: string; count: number}[]
  >([]);
  const [groupMembers, setGroupMembers] = useState<GroupMemberLoadedData[]>([]);
  const [profileAvatarUri, setProfileAvatarUri] = useState('');

  useEffect(() => {
    const fetchReactions = async () => {
      const fetchedReactions = await getRichReactions(chatId, messageId);
      setReactions(fetchedReactions);
      const calculatedReactionCounts: Record<string, number> = {};
      fetchedReactions.forEach(item => {
        const reaction = item.reaction;
        if (calculatedReactionCounts[reaction]) {
          calculatedReactionCounts[reaction]++;
        } else {
          calculatedReactionCounts[reaction] = 1;
        }
      });
      setReactionCounts([
        {reaction: 'All', count: fetchedReactions.length},
        ...Object.keys(calculatedReactionCounts).map(reaction => ({
          reaction: reaction,
          count: calculatedReactionCounts[reaction],
        })),
      ]);
    };
    fetchReactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    (async () => {
      const groupHandler = new Group(chatId);
      setGroupMembers(await groupHandler.getMembers());
      const profileUri = await getProfilePictureUri();
      if (profileUri) {
        setProfileAvatarUri(profileUri);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedPillIndex, setSelectedPillIndex] = useState<number>(0);

  const handleRemoveReaction = async (message: RichReaction | null) => {
    if (!message) {
      return;
    }
    const sender = new SendMessage(message.chatId, ContentType.reaction, {
      chatId: message.chatId,
      messageId: message.messageId,
      reaction: '',
      tombstone: true,
    });
    await sender.send();
    onClose();
  };
  const Colors = DynamicColors();

  const svgArray = [
    // 1.CrossButton
    {
      assetName: 'CrossButton',
      light: require('@assets/light/icons/Cross.svg').default,
      dark: require('@assets/dark/icons/Cross.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const CrossButton = results.CrossButton;

  const renderBarItem = (item: RichReaction, index: number, Colors: any) => {
    const selfReactedMessage = item.senderId === 'SELF' ? item : null;
    const receiverReactedMessage = item.senderId !== 'SELF' ? item : null;
    const groupMember = groupMembers.filter(x => x.memberId === item.senderId);
    const senderAvatarUri =
      groupMember.length > 0 ? groupMember[0].displayPic : null;

    return (
      <Pressable onPress={() => handleRemoveReaction(selfReactedMessage)}>
        <View style={styles.barItemContainer}>
          <AvatarBox
            avatarSize="s"
            key={index}
            profileUri={
              item.senderId === 'SELF' ? profileAvatarUri : senderAvatarUri
            }
          />
          <View style={styles.barItemTextContainer}>
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              {item.senderId === 'SELF'
                ? 'You'
                : receiverReactedMessage?.senderName ||
                  DEFAULT_GROUP_MEMBER_NAME}
            </NumberlessText>
            {item.senderId === 'SELF' && (
              <NumberlessText
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                Tap to remove
              </NumberlessText>
            )}
          </View>
          <NumberlessText
            fontSizeType={FontSizeType.xl}
            fontType={FontType.rg}>
            {item.reaction}
          </NumberlessText>
        </View>
        {index !== barDataToPrint.length - 1 && <LineSeparator />}
      </Pressable>
    );
  };

  const renderPillItem = (
    item: {reaction: string; count: number},
    index: number,
    Colors: any,
  ) => {
    return (
      <Pressable
        onPress={() => setSelectedPillIndex(index)}
        style={[
          styles.pillItemContainer,
          {
            borderColor:
              selectedPillIndex === index
                ? Colors.primary.accent
                : Colors.primary.stroke,
          },
        ]}>
        <NumberlessText
          textColor={Colors.text.primary}
          fontSizeType={
            item.reaction === 'All' ? FontSizeType.l : FontSizeType.xl
          }
          fontType={FontType.rg}>
          {item.reaction}
        </NumberlessText>
        <NumberlessText
          textColor={Colors.text.primary}
          fontSizeType={FontSizeType.l}
          fontType={FontType.rg}>
          {item.count}
        </NumberlessText>
      </Pressable>
    );
  };

  const barDataToPrint =
    selectedPillIndex === 0
      ? reactions
      : reactions.filter(
          reaction =>
            reaction.reaction === reactionCounts[selectedPillIndex]?.reaction,
        );

  const styles = styling(Colors);

  return (
    <PrimaryBottomSheet
      bgColor="g"
      showNotch={true}
      showClose={false}
      visible={visible}
      onClose={onClose}>
      <View style={styles.container}>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={reactionCounts}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          horizontal={true}
          renderItem={({item, index}) => renderPillItem(item, index, Colors)}
        />
        <Pressable onPress={onClose}>
          <CrossButton width={24} height={24} />
        </Pressable>
      </View>

      <SimpleCard style={styles.simpleCardContainer}>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={barDataToPrint}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          horizontal={false}
          renderItem={({item, index}) => renderBarItem(item, index, Colors)}
        />
      </SimpleCard>
    </PrimaryBottomSheet>
  );
};

const styling = Colors =>
  StyleSheet.create({
    container: {
      paddingTop: PortSpacing.secondary.top,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    barItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
    barItemTextContainer: {
      gap: 1,
      flex: 1,
      marginHorizontal: PortSpacing.secondary.uniform,
    },
    pillItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginRight: PortSpacing.tertiary.uniform,
      borderWidth: 1,
      paddingHorizontal: PortSpacing.tertiary.uniform,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: Colors.primary.surface,
    },
    simpleCardContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginTop: PortSpacing.secondary.top,
      marginBottom: PortSpacing.secondary.bottom,
    },
  });

export default RichGroupReactionsBottomsheet;
