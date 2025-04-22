import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import GradientCard from '@components/Cards/GradientCard';
import { useColors } from '@components/colorGuide';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import { AvatarBox } from '@components/Reusable/AvatarBox/AvatarBox';
import { Spacing } from '@components/spacingGuide';

import { DEFAULT_NAME } from '@configs/constants';

import DirectChat, { LineDataCombined } from '@utils/DirectChats/DirectChat';
import { getChatIdFromPairHash } from '@utils/Storage/connections';
import { getContact } from '@utils/Storage/contacts';
import { ContactEntry } from '@utils/Storage/DBCalls/contacts';

import { ToastType, useToast } from 'src/context/ToastContext';

const ConnectionsCard = ({
  allConnections,
}: {
  allConnections: ContactEntry[];
}) => {
  const Colors = useColors();
  const styles = styling(Colors);
  const navigation = useNavigation()
  const { showToast } = useToast()
  const onGoToProfile = async (pairHash: string) => {
    try {
      // Navigate to contact profile page.
      const contact = await getContact(pairHash);

      const chatId = await getChatIdFromPairHash(pairHash);
      let chatData: LineDataCombined | null = null;
      if (chatId) {
        const chat = new DirectChat(chatId);
        chatData = await chat.getChatData();
      }
      navigation.navigate('ContactProfile', {
        chatId,
        chatData: chatData,
        contactInfo: contact,
      });
    } catch (error) {
      console.error('Failed to navigate to profile:', error);
      showToast('Failed to navigate to profile, please try again', ToastType.error)
    }
  };

  return (
    <View style={{ paddingBottom: allConnections.length > 10 ? Spacing.xxl : 300 }}>
      <GradientCard style={styles.card}>
        <NumberlessText
          textColor={Colors.text.title}
          style={{ marginBottom: Spacing.s, marginTop: Spacing.s }}
          fontWeight={FontWeight.md}
          fontSizeType={FontSizeType.m}>
          Port Contacts
        </NumberlessText>
        <>
          {
            allConnections.length === 0 ? (
              <View style={styles.emptyItem}>
                <NumberlessText
                  textColor={Colors.text.subtitle}
                  fontWeight={FontWeight.rg}
                  fontSizeType={FontSizeType.s}>
                  You have no Port contacts yet. Try forming a new chat using the options above.
                </NumberlessText>
              </View>
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={allConnections}
                keyExtractor={(item) => item.pairHash}
                renderItem={({ item, index }) =>
                (<Pressable
                  onPress={() => onGoToProfile(item.pairHash)}
                  style={StyleSheet.compose(styles.list, {
                    borderBottomWidth: allConnections.length - 1 === index ? 0 : 0.5,
                    borderBottomColor: Colors.stroke,
                  })}>
                  <AvatarBox avatarSize="s" profileUri={item.displayPic} />
                  <NumberlessText
                    numberOfLines={1}
                    textColor={Colors.text.title}
                    fontWeight={FontWeight.rg}
                    fontSizeType={FontSizeType.m}>
                    {item.name || DEFAULT_NAME}
                  </NumberlessText>
                </Pressable>)
                }
              />)}
        </>
      </GradientCard>
    </View>
  )
}

const styling = (_color: any) =>
  StyleSheet.create({
    emptyItem: {
      paddingVertical: Spacing.l,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      paddingHorizontal: Spacing.l,
    },
    list: {
      paddingVertical: Spacing.s,
      gap: Spacing.l,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

export default ConnectionsCard;
