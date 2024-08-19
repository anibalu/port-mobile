import {PortSpacing, isIOS, screen} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import MultiSelectMembers from '@components/Reusable/MultiSelectMembers/MultiSelectMembers';
import SimpleTopbar from '@components/Reusable/TopBars/SimpleTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {ChatType} from '@utils/Storage/DBCalls/connections';
import {ConnectionInfo} from '@utils/Storage/DBCalls/connections';
import React, {useEffect, useMemo, useState} from 'react';
import {KeyboardAvoidingView, StyleSheet, View, ScrollView} from 'react-native';

import {TOPBAR_HEIGHT} from '@configs/constants';
import {getConnection} from '@utils/Storage/connections';
import {getConnections} from '@utils/Storage/connections';
// import SearchBar from '@components/Reusable/TopBars/SearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '@navigation/AppStackTypes';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {getMessage} from '@utils/Storage/messages';
import {getGroupMessage} from '@utils/Storage/groupMessages';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {mediaContentTypes} from '@utils/Messaging/Send/SendDirectMessage/senders/MediaSender';
import LargeDataUpload from '@utils/Messaging/LargeData/LargeDataUpload';
import {LargeDataParams} from '@utils/Messaging/interfaces';
import {copyToTmp} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import SearchBar from '@components/SearchBar';

type Props = NativeStackScreenProps<AppStackParamList, 'ForwardToContact'>;

const ForwardToContact = ({route, navigation}: Props) => {
  const {messages = [], chatId} = route.params;
  //for loader used in the screen
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMembers, setSelectedMembers] = useState<ConnectionInfo[]>([]);
  const [allMembers, setAllMembers] = useState<ConnectionInfo[]>([]);
  const [viewableMembers, setViewableMembers] = useState<ConnectionInfo[]>([]);

  //search text
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    (async () => {
      const connections = await getConnections(true);
      setAllMembers(connections);
      setViewableMembers(connections);
    })();
  }, []);

  useMemo(() => {
    const filteredData = allMembers.filter(item => {
      return item.name.toLowerCase().includes(searchText.toLowerCase());
    });
    setViewableMembers(filteredData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const onForward = async () => {
    setLoading(true);
    try {
      const getMessageFromChat =
        (await getConnection(chatId)).connectionType === ChatType.group
          ? getGroupMessage
          : getMessage;
      for (const id of messages) {
        const msg = await getMessageFromChat(chatId, id);
        if (msg) {
          if (mediaContentTypes.includes(msg.contentType)) {
            // Pre upload data to prevent iteration
            //forward screen fileUri to be forwarded is always from app storage.
            //create copy of file in tmp dir.
            const tmpUri = await copyToTmp(
              (msg.data as LargeDataParams).fileUri,
            );
            //then upload and send.
            const mediaData = msg.data as LargeDataParams;
            mediaData.fileUri = tmpUri;
            const uploader = new LargeDataUpload(
              mediaData.fileUri || 'Bad file uri',
              mediaData.fileName,
              mediaData.fileType || 'unused filetype',
            );
            await uploader.upload();
            const {mediaId, key} = uploader.getMediaIdAndKey();
            mediaData.mediaId = mediaId;
            mediaData.key = key;
          }
          for (const mbr of selectedMembers) {
            const sender = new SendMessage(
              mbr.chatId,
              msg.contentType,
              msg.data,
            );
            sender.send();
          }
        }
      }
    } catch (error) {
      console.error('Error forwarding', error);
    }
    setLoading(false);
    navigation.goBack();
  };

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

  return (
    <>
      <CustomStatusBar backgroundColor={Colors.primary.surface} />
      <SafeAreaView style={styles.screen}>
        <SimpleTopbar
          IconLeft={BackIcon}
          onIconLeftPress={() => navigation.goBack()}
          heading={
            selectedMembers.length > 0
              ? `Selected ${selectedMembers?.length}`
              : 'Select chats'
          }
        />
        <View style={styles.barWrapper}>
          <SearchBar
            style={styles.search}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        </View>
        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : 'height'}
          keyboardVerticalOffset={isIOS ? 50 : 0}
          style={styles.scrollViewContainer}>
          <ScrollView
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            <MultiSelectMembers
              selectedMembers={selectedMembers}
              setSelectedMembers={setSelectedMembers}
              members={viewableMembers}
            />
          </ScrollView>
          <View style={styles.buttonWrapper}>
            <PrimaryButton
              isLoading={loading}
              disabled={selectedMembers.length === 0}
              primaryButtonColor="b"
              buttonText={'Forward to selected'}
              onClick={async () => {
                await onForward();
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styling = (colors: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      alignSelf: 'center',
      justifyContent: 'flex-start',
      width: screen.width,
      backgroundColor: colors.primary.background,
    },
    scrollViewContainer: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingHorizontal: PortSpacing.secondary.uniform,
    },
    search: {
      backgroundColor: colors.primary.surface2,
      width: '100%',
      flexDirection: 'row',
      height: 44,
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: PortSpacing.tertiary.uniform,
    },
    barWrapper: {
      paddingHorizontal: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.primary.surface,
      alignItems: 'center',
      height: TOPBAR_HEIGHT,
    },
    buttonWrapper: {
      paddingVertical: PortSpacing.secondary.top,
    },
  });

export default ForwardToContact;
