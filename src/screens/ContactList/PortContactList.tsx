import React, {ReactElement, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import TopBarWithRightIcon from '@components/Reusable/TopBars/TopBarWithRightIcon';
import {SafeAreaView} from '@components/SafeAreaView';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import InviteContact from '@assets/icons/InviteContactOrange.svg';
import SearchBar from '@components/SearchBar';
import {PortSpacing} from '@components/ComponentUtils';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {checkAndAskContactPermission} from '@utils/AppPermissions';
import {getContacts} from '@utils/Storage/contacts';
import {getChatIdFromPairHash} from '@utils/Storage/connections';
import DirectChat from '@utils/DirectChats/DirectChat';
import {ContactEntry} from '@utils/Storage/DBCalls/contacts';
import {ToastType, useToast} from 'src/context/ToastContext';

type Props = NativeStackScreenProps<AppStackParamList, 'PortContactList'>;

const PortContactList = ({navigation}: Props) => {
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const [searchText, setSearchText] = useState<string>('');
  const [contactList, setContactList] = useState<any>({});
  const [numberOfContacts, setNumberOfContacts] = useState<number>(0);
  const [filteredContacts, setFilteredContacts] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const svgArray = [
    {
      assetName: 'CrossButton',
      light: require('@assets/light/icons/Cross.svg').default,
      dark: require('@assets/dark/icons/Cross.svg').default,
    },
    {
      assetName: 'AngleRight',
      light: require('@assets/light/icons/navigation/AngleRight.svg').default,
      dark: require('@assets/dark/icons/navigation/AngleRight.svg').default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const CrossButton = results.CrossButton;
  const AngleRight = results.AngleRight;
  const {showToast} = useToast();
  useEffect(() => {
    (async () => {
      try {
        const contacts = await getContacts();
        // Sorting contacts alphabetically
        contacts.sort((a, b) => a.name.localeCompare(b.name));

        // Grouping contacts by the first letter
        const groupedContacts = contacts.reduce((groups: any, contact) => {
          const firstLetter = contact.name[0].toUpperCase();
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
              contactList[key] as ContactEntry[]
            ).filter(contact =>
              contact.name.toLowerCase().includes(searchText.toLowerCase()),
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

  useMemo(() => {
    setNumberOfContacts(Object.values(filteredContacts).flat().length);
  }, [filteredContacts]);

  function renderContactTile({item}: {item: any}): ReactElement {
    const isLastInGroup =
      item.index === filteredContacts[item.firstLetter].length - 1;

    return (
      <Pressable
        onPress={async () => {
          const chatId = await getChatIdFromPairHash(item.pairHash);
          if (!chatId) {
            showToast(
              'This contact has no chat associated with it.',
              ToastType.error,
            );
            return;
          }
          const chat = new DirectChat(chatId);
          const chatData = await chat.getChatData();
          navigation.navigate('ContactProfile', {
            chatId,
            chatData: chatData,
          });
        }}>
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
          <AvatarBox avatarSize="s" profileUri={item.displayPic} />
          <NumberlessText
            numberOfLines={1}
            textColor={Colors.text.primary}
            fontType={FontType.rg}
            fontSizeType={FontSizeType.m}>
            {item.name}
          </NumberlessText>
        </View>
      </Pressable>
    );
  }

  const onClose = () => {
    navigation.goBack();
  };

  const onInviteContactClick = async () => {
    const granted = await checkAndAskContactPermission();
    if (granted) {
      navigation.navigate('PhoneContactList');
    }
  };

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={{backgroundColor: Colors.primary.background}}>
        <TopBarWithRightIcon
          heading={
            numberOfContacts > 0
              ? `Port contacts (${numberOfContacts})`
              : 'Port contacts'
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
              setSearchText={setSearchText}
            />
          </View>
          {/* invite contacts clickable card */}
          <View
            style={{
              marginHorizontal: PortSpacing.secondary.uniform,
            }}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.inviteCardHorizontal}
              onPress={onInviteContactClick}>
              <View
                style={StyleSheet.compose(styles.cardLeft, {
                  backgroundColor: Colors.lowAccentColors.orange,
                })}>
                <InviteContact height={32} width={32} />
              </View>
              <View style={styles.cardRight}>
                <NumberlessText
                  textColor={Colors.primary.mainelements}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}>
                  Invite existing contacts
                </NumberlessText>
                <NumberlessText
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  textColor={Colors.text.subtitle}
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.rg}>
                  Click here to invite your existing contacts to Port.
                </NumberlessText>
              </View>
              <AngleRight height={20} width={20} />
            </TouchableOpacity>
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
                    contacts
                      .filter(
                        (contact: any, _index: number) => contact.pairHash,
                      )
                      .map((contact: any, index: number) => ({
                        ...contact,
                        firstLetter,
                        index,
                      })),
                )}
                renderItem={renderContactTile}
                keyExtractor={item => item.pairHash}
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
                      No Contacts found
                    </NumberlessText>
                  </View>
                )}
              />
            )}
          </View>
        </View>
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

export default PortContactList;
