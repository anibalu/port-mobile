import {PortSpacing, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import DynamicColors from '@components/DynamicColors';
import SimpleTopbar from '@components/Reusable/TopBars/SimpleTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import React, {ReactElement, useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import SearchBar from '@components/SearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {
  DEFAULT_GROUP_MEMBER_NAME,
  DEFAULT_PROFILE_AVATAR_INFO,
} from '@configs/constants';
import {GroupMemberLoadedData} from '@utils/Storage/DBCalls/groupMembers';
import GroupMemberInfoBottomsheet from '@components/Reusable/BottomSheets/GroupMemberInfoBottomsheet';
import {useSelector} from 'react-redux';
import {getChatIdFromPairHash} from '@utils/Storage/connections';

type Props = NativeStackScreenProps<AppStackParamList, 'AllMembers'>;

interface GroupMemberUseableData extends GroupMemberLoadedData {
  directChatId?: string | null;
}

const AllMembers = ({route, navigation}: Props) => {
  const {chatId, members, chatData} = route.params;
  const profile = useSelector(state => state.profile.profile);
  const {name, avatar} = useMemo(() => {
    return {
      name: 'You',
      avatar: profile?.profilePicInfo || DEFAULT_PROFILE_AVATAR_INFO,
    };
  }, [profile]);
  const [searchText, setSearchText] = useState('');
  const [allMembers, setAllMembers] =
    useState<GroupMemberLoadedData[]>(members);
  const [viewableMembers, setViewableMembers] = useState<
    GroupMemberLoadedData[]
  >([
    {
      name: name,
      displayPic: avatar.fileUri,
      isAdmin: chatData.amAdmin,
      memberId: 'self',
      pairHash: 'self',
      joinedAt: chatData.joinedAt,
      cryptoId: 'self',
      deleted: chatData.disconnected,
    },
    ...allMembers,
  ]);
  const [selectedMember, setSelectedMember] =
    useState<GroupMemberUseableData | null>(null);
  const Colors = DynamicColors();
  const styles = styling(Colors);
  const svgArray = [
    {
      assetName: 'BackIcon',
      light: require('@assets/light/icons/navigation/BlackArrowLeftThin.svg')
        .default,
      dark: require('@assets/dark/icons/navigation/BlackArrowLeftThin.svg')
        .default,
    },
  ];
  const results = useDynamicSVG(svgArray);
  const BackIcon = results.BackIcon;

  useMemo(() => {
    if (searchText === '') {
      const filteredData = [
        {
          name: name,
          displayPic: avatar.fileUri,
          isAdmin: chatData.amAdmin,
          memberId: 'self',
          pairHash: 'self',
          joinedAt: chatData.joinedAt,
          cryptoId: 'self',
          deleted: chatData.disconnected,
        },
        ...allMembers,
      ];
      setViewableMembers(filteredData);
    } else {
      const filteredData = allMembers.filter(item =>
        item.name?.toLowerCase().includes(searchText.toLowerCase()),
      );
      setViewableMembers(filteredData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, allMembers]);

  function renderMemberTile({
    item,
    index,
  }: {
    item: GroupMemberLoadedData;
    index: number;
  }): ReactElement {
    return (
      <>
        <Pressable
          onPress={async () => {
            if (item.memberId && item.memberId !== 'self') {
              const directChatId = await getChatIdFromPairHash(item.pairHash);
              setSelectedMember({...item, directChatId});
            } else if (item.memberId && item.memberId === 'self') {
              navigation.navigate('MyProfile');
            }
          }}
          style={StyleSheet.compose(styles.row, {
            borderBottomWidth: 0.5,
            borderBottomColor:
              viewableMembers.length - 1 === index
                ? 'transparent'
                : Colors.primary.stroke,
          })}>
          <AvatarBox avatarSize="s" profileUri={item.displayPic} />
          <View style={styles.item}>
            <NumberlessText
              style={{
                color: Colors.labels.text,
                paddingLeft: PortSpacing.secondary.left,
              }}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.m}>
              {item.name || DEFAULT_GROUP_MEMBER_NAME}
            </NumberlessText>
            {item.isAdmin && (
              <View
                style={{
                  backgroundColor: Colors.primary.background,
                  padding: 4,
                  borderRadius: 6,
                }}>
                <NumberlessText
                  textColor={Colors.text.subtitle}
                  fontType={FontType.rg}
                  fontSizeType={FontSizeType.m}>
                  Admin
                </NumberlessText>
              </View>
            )}
          </View>
        </Pressable>
      </>
    );
  }

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={styles.screen}>
        <SimpleTopbar
          IconLeft={BackIcon}
          onIconLeftPress={() => navigation.goBack()}
          heading={'All members'}
        />
        <View style={styles.barWrapper}>
          <SearchBar
            style={styles.search}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        </View>
        <View style={{marginTop: PortSpacing.secondary.top}}>
          <FlatList
            data={viewableMembers}
            keyExtractor={item => item.memberId}
            renderItem={renderMemberTile}
            style={styles.contactListContainer}
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
                  No matching members found
                </NumberlessText>
              </View>
            )}
          />
        </View>
        {selectedMember && (
          <GroupMemberInfoBottomsheet
            chatId={chatId}
            amAdmin={chatData.amAdmin}
            member={selectedMember}
            setMembers={setAllMembers}
            onClose={() => setSelectedMember(null)}
            visible={selectedMember ? true : false}
          />
        )}
      </SafeAreaView>
    </>
  );
};

const styling = (color: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      alignSelf: 'center',
      justifyContent: 'flex-start',
      width: screen.width,
      backgroundColor: color.primary.background,
    },
    contactListContainer: {
      borderWidth: 0.5,
      backgroundColor: color.primary.surface,
      borderColor: color.primary.stroke,
      marginHorizontal: PortSpacing.secondary.uniform,
      borderRadius: PortSpacing.secondary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
      paddingVertical: PortSpacing.tertiary.uniform,
    },
    card: {
      marginVertical: PortSpacing.secondary.uniform,
      marginHorizontal: PortSpacing.secondary.uniform,
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
    scrollViewContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },
    barWrapper: {
      paddingHorizontal: PortSpacing.secondary.uniform,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: color.primary.surface,
      paddingVertical: PortSpacing.tertiary.uniform,
    },
    search: {
      backgroundColor: color.primary.surface2,
      width: '100%',
      flexDirection: 'row',
      height: 44,
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: PortSpacing.tertiary.uniform,
    },
    row: {
      paddingVertical: PortSpacing.tertiary.bottom,
      flexDirection: 'row',
      alignItems: 'center',
    },
    item: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
export default AllMembers;
