import React, {ReactElement, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import Contacts from 'react-native-contacts';
import SearchBar from '@components/SearchBar';
import {PortSpacing} from '@components/ComponentUtils';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {useTheme} from 'src/context/ThemeContext';
import InviteContactBottomsheet from '@components/Reusable/BottomSheets/InviteContactBottomsheet';

type Props = NativeStackScreenProps<AppStackParamList, 'PhoneContactList'>;

interface ContactInfo {
  contactName: string;
  contactEmail: Contacts.EmailAddress[];
  contactNumber: Contacts.PhoneNumber[];
}

const PhoneContactList = ({route, navigation}: Props) => {
  const Colors = DynamicColors();
  const {themeValue} = useTheme();

  const styles = styling(Colors);
  const [searchText, setSearchtext] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [contactList, setContactList] = useState<any>({});
  const [filteredContacts, setFilteredContacts] = useState<any>({});
  const [numberOfContacts, setNumberOfContacts] = useState<number>(0);
  const [selectedContacInfo, setSelectedContactInfo] =
    useState<ContactInfo | null>(null);

  const svgArray = [
    {
      assetName: 'CrossButton',
      light: require('@assets/light/icons/Cross.svg').default,
      dark: require('@assets/dark/icons/Cross.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const CrossButton = results.CrossButton;

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
      <View>
        {item.index === 0 && (
          <View style={{paddingTop: PortSpacing.tertiary.uniform}}>
            <NumberlessText
              textColor={Colors.primary.mediumgrey}
              fontType={FontType.md}
              fontSizeType={FontSizeType.m}>
              {item.firstLetter}
            </NumberlessText>
          </View>
        )}
        <View
          style={{
            paddingVertical: PortSpacing.tertiary.uniform,
            gap: PortSpacing.secondary.uniform,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: isLastInGroup ? 0 : 0.5,
            borderBottomColor: Colors.primary.stroke,
          }}>
          <AvatarBox avatarSize="s" profileUri={item.thumbnailPath} />
          <View style={{flex: 1}}>
            <NumberlessText
              numberOfLines={1}
              textColor={Colors.text.primary}
              fontType={FontType.rg}
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
              borderRadius: PortSpacing.tertiary.uniform,
              backgroundColor:
                themeValue === 'light'
                  ? Colors.lowAccentColors.violet
                  : Colors.primary.accent,
            }}>
            <NumberlessText
              numberOfLines={1}
              textColor={
                themeValue === 'light'
                  ? Colors.primary.accent
                  : Colors.text.primary
              }
              fontType={FontType.sb}
              fontSizeType={FontSizeType.s}>
              INVITE
            </NumberlessText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  useMemo(() => {
    setNumberOfContacts(Object.values(filteredContacts).flat().length);
  }, [filteredContacts]);

  const onClose = () => {
    route?.params?.fromOnboardingStack
      ? navigation.navigate('OnboardingSetupScreen')
      : navigation.navigate('HomeTab');
  };

  const onInviteContactClick = (contact: ContactInfo) => {
    setSelectedContactInfo(contact);
  };

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <TopBarWithRightIcon
          heading={
            numberOfContacts > 0
              ? `Phone contacts (${numberOfContacts})`
              : 'Phone contacts'
          }
          IconRight={CrossButton}
          onIconRightPress={onClose}
        />

        <View
          style={{
            gap: PortSpacing.secondary.uniform,
            flex: 1,
          }}>
          <View
            style={{
              paddingHorizontal: PortSpacing.secondary.uniform,
              paddingVertical: PortSpacing.tertiary.uniform,
              backgroundColor: Colors.primary.surface,
            }}>
            <SearchBar
              style={{
                backgroundColor: Colors.primary.surface2,
                height: 44,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 12,
                paddingHorizontal: PortSpacing.tertiary.uniform,
              }}
              searchText={searchText}
              setSearchText={setSearchtext}
            />
          </View>
          {/* main container */}
          <View style={{flexShrink: 1}}>
            {isLoading ? (
              <ActivityIndicator color={Colors.text.subtitle} />
            ) : (
              <FlatList
                data={Object.entries(filteredContacts).flatMap(
                  ([firstLetter, contacts]: [
                    firstLetter: any,
                    contacts: any,
                  ]) =>
                    contacts.map(
                      (contact: Contacts.Contact, index: number) => ({
                        ...contact,
                        firstLetter,
                        index,
                      }),
                    ),
                )}
                renderItem={renderContactTile}
                keyExtractor={item => item.recordID}
                style={styles.contactListContainer}
                ListHeaderComponent={<View style={{height: 4}} />}
                ListFooterComponent={
                  <View style={{height: PortSpacing.secondary.bottom}} />
                }
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
        {/* We need to conditionally mount and unmount the modal for better state cleanup */}
        {selectedContacInfo && (
          <InviteContactBottomsheet
            onLinkShare={route?.params?.onLinkShare || null}
            visible={selectedContacInfo ? true : false}
            onClose={() => {
              setSelectedContactInfo(null);
            }}
            name={selectedContacInfo.contactName}
            email={selectedContacInfo.contactEmail}
            phoneNumber={selectedContacInfo.contactNumber}
          />
        )}
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    contactListContainer: {
      borderWidth: 0.5,
      backgroundColor: colors.primary.surface,
      borderColor: colors.primary.stroke,
      marginHorizontal: PortSpacing.secondary.uniform,
      borderRadius: PortSpacing.secondary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.tertiary.uniform,
    },
    cardRight: {
      gap: 4,
      marginHorizontal: PortSpacing.secondary.uniform,
      flex: 1,
    },
    cardLeft: {
      padding: PortSpacing.medium.uniform,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: PortSpacing.tertiary.uniform,
    },
    inviteCardHorizontal: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: PortSpacing.secondary.uniform,
      backgroundColor: colors.primary.surface,
      borderRadius: PortSpacing.secondary.uniform,
      borderWidth: 0.5,
      borderColor: colors.primary.stroke,
    },
  });

export default PhoneContactList;
