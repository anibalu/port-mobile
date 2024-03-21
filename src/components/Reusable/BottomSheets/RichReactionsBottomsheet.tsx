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

import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import PrimaryBottomSheet from './PrimaryBottomSheet';
import {PortColors, PortSpacing} from '@components/ComponentUtils';
import BlackCross from '@assets/icons/BlackCross.svg';
import {getRichReactions} from '@utils/Storage/reactions';
import SimpleCard from '../Cards/SimpleCard';
import {AvatarBox} from '../AvatarBox/AvatarBox';
import LineSeparator from '../Separators/LineSeparator';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {getProfilePictureUri} from '@utils/Profile';
import DirectChat from '@utils/DirectChats/DirectChat';

interface ReactionItem {
  senderName?: string;
  reaction: string;
  senderId?: string;
}

const RichReactionsBottomsheet = ({
  visible,
  onClose,
  chatId,
  currentReactionMessage,
}: {
  visible: boolean;
  onClose: () => void;
  chatId: string;
  currentReactionMessage: string[];
}) => {
  const [reactions, setReactions] = useState<ReactionItem[]>([]);
  const [senderAvatarUri, setSenderAvatarUri] = useState<string>('');
  const [profileAvatarUri, setProfileAvatarUri] = useState('');

  useEffect(() => {
    const fetchReactions = async () => {
      const fetchedReactions = await getRichReactions(
        chatId,
        currentReactionMessage[1],
      );
      setReactions(fetchedReactions);
    };
    fetchReactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    (async () => {
      const chatData = await new DirectChat(chatId).getChatData();
      const profileUri = await getProfilePictureUri();

      if (profileUri) {
        setProfileAvatarUri(profileUri);
      }

      if (chatData.displayPic) {
        setSenderAvatarUri(chatData.displayPic);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedPillIndex, setSelectedPillIndex] = useState<number>(0);

  const handleRemoveReaction = async (message: SavedMessageParams) => {
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

  const renderBarItem = (item: ReactionItem, index: number) => {
    const selfReactedMessage = item.senderId === 'SELF' ? item : null;
    const receiverReactedMessage = item.senderId === 'PEER' ? item : null;

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
              fontSizeType={FontSizeType.m}
              fontType={FontType.rg}>
              {item.senderId === 'SELF'
                ? 'You'
                : receiverReactedMessage?.senderName || ''}
            </NumberlessText>
            {item.senderId === 'SELF' && (
              <NumberlessText
                textColor={PortColors.subtitle}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                Tap to remove
              </NumberlessText>
            )}
          </View>
          <NumberlessText
            fontSizeType={FontSizeType.exs}
            fontType={FontType.rg}>
            {item.reaction}
          </NumberlessText>
        </View>
        {index !== barDataToPrint.length - 1 && <LineSeparator />}
      </Pressable>
    );
  };

  const renderPillItem = (item: ReactionItem, index: number) => {
    let count = 1;

    if (item.reaction === 'All') {
      count = reactions.length;
    } else {
      const uniqueReaction = reactions.filter(
        reactionItem => reactionItem.reaction === item.reaction,
      );
      count = uniqueReaction.length > 1 ? 2 : 1;
    }

    if (count > 1 && index === reactions.length) {
      return null;
    }

    return (
      <Pressable
        onPress={() => setSelectedPillIndex(index)}
        style={[
          styles.pillItemContainer,
          {
            borderColor:
              selectedPillIndex === index
                ? PortColors.primary.blue.app
                : PortColors.stroke,
          },
        ]}>
        <NumberlessText
          fontSizeType={
            item.reaction === 'All' ? FontSizeType.l : FontSizeType.exs
          }
          fontType={FontType.rg}>
          {item.reaction}
        </NumberlessText>
        <NumberlessText fontSizeType={FontSizeType.l} fontType={FontType.rg}>
          {count}
        </NumberlessText>
      </Pressable>
    );
  };

  const barDataToPrint =
    selectedPillIndex === 0
      ? reactions
      : reactions.filter(
          reaction =>
            reaction.reaction === reactions[selectedPillIndex - 1]?.reaction,
        );

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
          data={[{reaction: 'All'}, ...reactions]}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          horizontal={true}
          renderItem={({item, index}) => renderPillItem(item, index)}
        />
        <Pressable onPress={onClose}>
          <BlackCross width={24} height={24} />
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
          renderItem={({item, index}) => renderBarItem(item, index)}
        />
      </SimpleCard>
    </PrimaryBottomSheet>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: PortColors.primary.white,
  },
  simpleCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: PortSpacing.secondary.top,
    marginBottom: PortSpacing.secondary.bottom,
  },
});

export default RichReactionsBottomsheet;
