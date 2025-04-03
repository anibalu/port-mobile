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
  FontType,
  FontWeight,
  NumberlessText,
} from '@components/NumberlessText';
import {useColors} from '@components/colorGuide';
import TopBarDescription from '@components/Text/TopBarDescription';
import {GradientScreenView} from '@components/GradientScreenView';
import {Height, Spacing} from '@components/spacingGuide';
import {defaultFolderInfo, defaultPermissions} from '@configs/constants';

type Props = NativeStackScreenProps<AppStackParamList, 'PhoneContactList'>;

interface ContactInfo {
  contactName: string;
  contactEmail: Contacts.EmailAddress[];
  contactNumber: Contacts.PhoneNumber[];
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
        // // Grouping contacts by the first letter
        const groupedContacts = contacts
          .filter(x => x.givenName)
          .reduce((groups: any, contact) => {
            const firstLetter = contact.givenName[0].toUpperCase();
            if (!groups[firstLetter]) {
              groups[firstLetter] = [];
            }
            groups[firstLetter].push(contact);
            return groups;
          }, {});

        setContactList(groupedContacts);
        setFilteredContacts(groupedContacts);
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
        const filtered = Object.keys(contactList).reduce(
          (result: any, key: string) => {
            const matchingContacts = (
              contactList[key] as Contacts.Contact[]
            ).filter(contact =>
              (contact.givenName + ' ' + contact.familyName)
                .toLowerCase()
                .includes(searchText.toLowerCase()),
            );
            if (matchingContacts.length > 0) {
              result[key] = matchingContacts;
            }
            return result;
          },
          {},
        );
        setFilteredContacts(filtered);
      }
    }
  }, [searchText, contactList]);

  interface ItemInterface extends Contacts.Contact {
    firstLetter: string;
    index: number;
  }
  function renderContactTile({item}: {item: ItemInterface}): ReactElement {
    const isLastInGroup =
      item.index === filteredContacts[item.firstLetter].length - 1;
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
            padding: 10,
            borderRadius: Spacing.s,
            backgroundColor: Colors.accent,
          }}>
          <NumberlessText
            numberOfLines={1}
            textColor={Colors.surface}
            fontWeight={FontWeight.rg}
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
      title="Contacts"
      onBackPress={onBackPress}
      modifyNavigationBarColor={true}
      bottomNavigationBarColor={Colors.black}>
      <View style={styles.scrollContainer}>
        <TopBarDescription
          theme={Colors.theme}
          description="Invite your contacts to experience Port, where every conversation is secure and clutter-free."
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
                borderRadius: 12,
                paddingHorizontal: Spacing.s,
              }}
              searchText={searchText}
              setSearchText={setSearchtext}
            />
          </View>
          {isLoading ? (
            <ActivityIndicator color={Colors.text.subtitle} />
          ) : (
            <FlatList
              data={Object.entries(filteredContacts).flatMap(
                ([firstLetter, contacts]: [firstLetter: any, contacts: any]) =>
                  contacts.map((contact: Contacts.Contact, index: number) => ({
                    ...contact,
                    firstLetter,
                    index,
                  })),
              )}
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
                    fontType={FontType.rg}>
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
      marginHorizontal: Spacing.m,
      borderRadius: Spacing.m,
      paddingHorizontal: Spacing.m,
      paddingVertical: Spacing.s,
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
      paddingHorizontal: Spacing.l,
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
