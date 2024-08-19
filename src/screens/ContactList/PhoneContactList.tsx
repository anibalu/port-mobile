import React, {ReactElement, useEffect, useState} from 'react';
import {FlatList, StyleSheet, View, TouchableOpacity} from 'react-native';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import Contacts from 'react-native-contacts';
import {AVATAR_ARRAY, TOPBAR_HEIGHT} from '@configs/constants';
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
interface ContactInfo {
  contactName: string;
  contactEmail?: string;
  contactNumber?: string;
}

type Props = NativeStackScreenProps<AppStackParamList, 'PhoneContactList'>;

const PhoneContactList = ({navigation}: Props) => {
  const Colors = DynamicColors();
  const {themeValue} = useTheme();

  const styles = styling(Colors);
  const [searchText, setSearchtext] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [contactList, setContactList] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [selectedContacInfo, setSelectedContactInfo] = useState<ContactInfo>({
    contactName: '',
  });

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
    Contacts.getAll()
      .then(contacts => {
        // Sorting contacts alphabetically
        contacts.sort((a, b) =>
          (a.givenName + ' ' + a.familyName).localeCompare(
            b.givenName + ' ' + b.familyName,
          ),
        );

        // // Grouping contacts by the first letter
        const groupedContacts = contacts.reduce((groups: any, contact) => {
          const firstLetter = contact.givenName[0].toUpperCase();
          if (!groups[firstLetter]) {
            groups[firstLetter] = [];
          }
          groups[firstLetter].push(contact);
          return groups;
        }, {});

        setContactList(groupedContacts);
        setFilteredContacts(groupedContacts);
      })
      .catch(e => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    // Filter the contacts based on the search text
    if (searchText.trim() === '') {
      setFilteredContacts(contactList);
    } else {
      const filtered = Object.keys(contactList).reduce((result, key) => {
        const matchingContacts = contactList[key].filter(contact =>
          (contact.givenName + ' ' + contact.familyName)
            .toLowerCase()
            .includes(searchText.toLowerCase()),
        );
        if (matchingContacts.length > 0) {
          result[key] = matchingContacts;
        }
        return result;
      }, {});

      setFilteredContacts(filtered);
    }
  }, [searchText, contactList]);

  function renderContactTile({item}: {item: any}): ReactElement {
    const isLastInGroup =
      item.index === filteredContacts[item.firstLetter].length - 1;
    const contactName = item.givenName + ' ' + item.familyName;

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
          <AvatarBox
            avatarSize="s"
            profileUri={item.thumbnailPath ?? AVATAR_ARRAY[0]}
          />
          <View style={{flex: 1}}>
            <NumberlessText
              numberOfLines={1}
              textColor={Colors.text.primary}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}>
              {contactName}
            </NumberlessText>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              onInviteContactClick({
                contactName: item.givenName,
                contactEmail: item.emailAddresses[0],
                contactNumber: item.phoneNumbers[0]?.number,
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
        <InviteContactBottomsheet
          visible={visible}
          setVisible={setVisible}
          name={selectedContacInfo.contactName}
          email={selectedContacInfo.contactEmail || ''}
          number={selectedContacInfo.contactNumber || ''}
        />
      </View>
    );
  }

  const onClose = () => {
    navigation.goBack();
  };

  const onInviteContactClick = (contact: ContactInfo) => {
    setSelectedContactInfo(contact);
    setVisible(true);
  };

  const numContacts = Object.values(contactList).flat().length;

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <TopBarWithRightIcon
          heading={
            numContacts > 0
              ? `Phone contacts (${numContacts})`
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
          {numContacts > 0 && (
            <View
              style={{
                paddingHorizontal: PortSpacing.secondary.uniform,
                paddingVertical: PortSpacing.tertiary.uniform,
                backgroundColor: Colors.primary.surface,
                borderTopWidth: 0.5,
                borderTopColor: Colors.primary.stroke,
              }}>
              <SearchBar
                style={{
                  backgroundColor: Colors.primary.background,
                  borderWidth: 0.5,
                  borderColor: Colors.primary.stroke,
                  borderRadius: PortSpacing.medium.uniform,
                }}
                searchText={searchText}
                setSearchText={setSearchtext}
              />
            </View>
          )}
          {/* main container */}
          <View style={{flexShrink: 1}}>
            {Object.keys(filteredContacts).length > 0 ? (
              <FlatList
                data={Object.entries(filteredContacts).flatMap(
                  ([firstLetter, contacts]) =>
                    contacts.map((contact: any, index: number) => ({
                      ...contact,
                      firstLetter,
                      index,
                    })),
                )}
                renderItem={renderContactTile}
                keyExtractor={item => item.recordID}
                style={styles.contactListContainer}
                ListHeaderComponent={<View style={{height: 4}} />}
                ListFooterComponent={
                  <View style={{height: PortSpacing.secondary.bottom}} />
                }
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <NumberlessText
                  style={{textAlign: 'center'}}
                  textColor={Colors.primary.mediumgrey}
                  fontType={FontType.rg}
                  fontSizeType={FontSizeType.l}>
                  No contacts found
                </NumberlessText>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    placeholderContainer: {
      padding: TOPBAR_HEIGHT,
      justifyContent: 'center',
    },
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
