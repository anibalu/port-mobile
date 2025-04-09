import React, {ReactElement, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {AppStackParamList} from '@navigation/AppStack/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Contacts from 'react-native-contacts';
import SearchBar from '@components/SearchBar';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {
  FontSizeType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {useColors} from '@components/colorGuide';
import TopBarDescription from '@components/Text/TopBarDescription';
import {GradientScreenView} from '@components/GradientScreenView';
import {Height, Spacing} from '@components/spacingGuide';
import {defaultFolderInfo, defaultPermissions} from '@configs/constants';
import { Contact, EmailAddress, PhoneNumber } from 'react-native-contacts/type';

type Props = NativeStackScreenProps<AppStackParamList, 'PhoneContactList'>;

interface ContactInfo {
  contactName: string;
  contactEmail: EmailAddress[];
  contactNumber: PhoneNumber[];
}

const PhoneContactList = ({navigation}: Props) => {
  const Colors = useColors();

  const styles = styling(Colors);
  const [searchText, setSearchtext] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [contactList, setContactList] = useState<any>({});
  const [filteredContacts, setFilteredContacts] = useState<any>({});

  // handles back navigation on backpress
  const onBackPress = () => {
    navigation.goBack();
  };
  useEffect(() => {
    // fetching all contacts from phonebook
    (async () => {
      try {
        const contacts = await Contacts.getAll();
        // Sorting contacts alphabetically
        contacts.sort((a, b) =>
          (a.givenName + ' ' + a.familyName).localeCompare(
            b.givenName + ' ' + b.familyName,
          ),
        );

        setContactList(contacts);
        setFilteredContacts(contacts);
      } catch (error) {
        console.error('Error loading contacts: ', error);
      }
      setIsLoading(false);
    })();
  }, []);

  useMemo(() => {
    if (contactList) {
      // Filter the contacts based on the search text
      if (searchText.trim() === '') {
        setFilteredContacts(contactList);
      } else {
        const filteredData = contactList.filter(item => {
          return item.displayName
            .toLowerCase()
            .includes(searchText.toLowerCase());
        });
        setFilteredContacts(filteredData);
      }
    }
  }, [searchText, contactList]);

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
        style={{
          paddingVertical: Spacing.s,
          gap: Spacing.s,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: isLastInGroup ? 0 : 0.5,
          borderBottomColor: Colors.stroke,
        }}>
        <AvatarBox avatarSize="s" profileUri={item.thumbnailPath} />
        <View style={{flex: 1}}>
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
              contactName: item.givenName,
              contactEmail: item.emailAddresses,
              contactNumber: item.phoneNumbers,
            })
          }
          style={{
            padding: Spacing.s,
            borderRadius: Spacing.s,
            backgroundColor:
              Colors.theme === 'dark' ? Colors.surface2 : Colors.accent,
          }}>
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

  const onInviteContactClick = (contact: ContactInfo) => {
    navigation.navigate('NewPortStack', {
      screen: 'PortQRScreen',
      params: {
        contactName: contact.contactName,
        permissions: {...defaultPermissions},
        folderId: defaultFolderInfo.folderId,
      },
    });
  };

  return (
    <GradientScreenView
      color={Colors}
      title="Invite phone contacts"
      onBackPress={onBackPress}
      modifyNavigationBarColor={true}
      bottomNavigationBarColor={Colors.black}>
      <View style={styles.scrollContainer}>
        <TopBarDescription
          theme={Colors.theme}
          description="Create Ports for your favourite phone contacts and invite them to Port to enjoy a clutter-free, secure chat experience."
        />
        <View style={styles.scrollableElementsParent}>
          <View
            style={{
              paddingHorizontal: Spacing.l,
            }}>
            <SearchBar
              style={{
                backgroundColor: Colors.surface2,
                height: Height.searchBar,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: Spacing.m,
              }}
              searchText={searchText}
              setSearchText={setSearchtext}
            />
          </View>
          {isLoading ? (
            <ActivityIndicator color={Colors.text.subtitle} />
          ) : (
            <FlatList
              data={filteredContacts}
              renderItem={renderContactTile}
              keyExtractor={item => item.recordID}
              style={styles.contactListContainer}
              ListHeaderComponent={<View style={{height: 4}} />}
              ListFooterComponent={<View style={{height: Spacing.l}} />}
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
                    fontWeight={FontWeight.rg}>
                    No Phone Contacts found
                  </NumberlessText>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </GradientScreenView>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    contactListContainer: {
      borderWidth: 0.5,
      backgroundColor: colors.surface,
      borderColor: colors.stroke,
      borderRadius: Spacing.m,
      paddingHorizontal: Spacing.m,
      paddingVertical: Spacing.s,
      marginHorizontal: Spacing.m,
    },
    scrollContainer: {
      backgroundColor: colors.background,
      flex: 1,
    },
    cardRight: {
      gap: 4,
      marginHorizontal: Spacing.m,
      flex: 1,
    },
    scrollableElementsParent: {
      marginTop: -Spacing.xxl,
      paddingBottom: Spacing.l,
      gap: Spacing.l,
    },
    cardLeft: {
      padding: Spacing.m,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Spacing.s,
    },
    inviteCardHorizontal: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: Spacing.m,
      backgroundColor: colors.surface,
      borderRadius: Spacing.m,
      borderWidth: 0.5,
      borderColor: colors.stroke,
    },
  });

export default PhoneContactList;
