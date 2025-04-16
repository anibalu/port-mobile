import React, { ReactElement } from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'

import { Contact, EmailAddress, PhoneNumber } from 'react-native-contacts/type'

import GradientCard from '@components/Cards/GradientCard'
import { useColors } from '@components/colorGuide'
import { FontSizeType, FontWeight, NumberlessText } from '@components/NumberlessText'
import { AvatarBox } from '@components/Reusable/AvatarBox/AvatarBox'
import { Spacing } from '@components/spacingGuide'


interface ContactInfo {
  contactName: string;
  contactEmail: EmailAddress[];
  contactNumber: PhoneNumber[];
}

const ContactsList = ({ filteredContacts, onInviteContactClick }: {
  filteredContacts: any; onInviteContactClick: (contact: ContactInfo) => void
}) => {

  const Colors = useColors()
  const styles = styling(Colors)

  interface ItemInterface extends Contact {
    firstLetter: string;
    index: number;
  }
  function renderContactTile({
    item,
    index,
  }: {
    item: ItemInterface;
    index: number;
  }): ReactElement {
    const isLastInGroup = index === filteredContacts.length - 1;
    return (
      <View
        style={StyleSheet.compose(styles.card, {

          borderBottomWidth: isLastInGroup ? 0 : 0.5,
          borderBottomColor: Colors.stroke,
        })}>
        <AvatarBox avatarSize="s" profileUri={item.thumbnailPath} />
        <View style={{ flex: 1 }}>
          <NumberlessText
            numberOfLines={1}
            textColor={Colors.text.title}
            fontWeight={FontWeight.rg}
            fontSizeType={FontSizeType.m}>
            {item.givenName + ' ' + item.familyName}
          </NumberlessText>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            onInviteContactClick({
              contactName: item.givenName + ' ' + item.familyName || '',
              contactEmail: item.emailAddresses,
              contactNumber: item.phoneNumbers,
            })
          }
          style={styles.button}>
          <NumberlessText
            numberOfLines={1}
            textColor={
              Colors.theme === 'dark' ? Colors.text.title : Colors.surface
            }
            fontWeight={FontWeight.md}
            fontSizeType={FontSizeType.s}>
            INVITE
          </NumberlessText>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={{paddingBottom: filteredContacts.length > 10 ? Spacing.xxl : 300}}>
    <GradientCard style={{ paddingHorizontal: Spacing.l }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={filteredContacts}
        renderItem={renderContactTile}
        keyExtractor={item => item.recordID}
        ListEmptyComponent={() => (
          <View
            style={styles.placeholder}>
            <NumberlessText
              textColor={Colors.text.subtitle}
              fontSizeType={FontSizeType.l}
              fontWeight={FontWeight.rg}>
              No Phone Contacts found
            </NumberlessText>
          </View>
        )}
      />
    </GradientCard>
    </View>
  )
}

const styling = (Colors: any) => StyleSheet.create({
  card: {
    paddingVertical: Spacing.m,
    gap: Spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: Spacing.s,
    borderRadius: Spacing.s,
    backgroundColor:
      Colors.theme === 'dark' ? Colors.surface2 : Colors.accent,
  },
  placeholder: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  }
})



export default ContactsList
