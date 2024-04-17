import {
  PortColors,
  PortSpacing,
  isIOS,
  screen,
} from '@components/ComponentUtils';
import {CustomStatusBar} from '@components/CustomStatusBar';
import MultiSelectMembers from '@components/Reusable/MultiSelectMembers/MultiSelectMembers';
import SimpleTopbar from '@components/Reusable/TopBars/SimpleTopBar';
import {SafeAreaView} from '@components/SafeAreaView';
import {ChatType, ConnectionInfo} from '@utils/Connections/interfaces';
import React, {useEffect, useMemo, useState} from 'react';
import {KeyboardAvoidingView, StyleSheet, View, ScrollView} from 'react-native';
import BackIcon from '@assets/navigation/backButton.svg';
import SearchIcon from '@assets/icons/searchThin.svg';
import {TOPBAR_HEIGHT} from '@configs/constants';
import {getConnection, getConnections} from '@utils/Connections';
import SearchBar from '@components/Reusable/TopBars/SearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '@navigation/AppStackTypes';
import PrimaryButton from '@components/Reusable/LongButtons/PrimaryButton';
import {getGroupMessage, getMessage} from '@utils/Storage/messages';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {mediaContentTypes} from '@utils/Messaging/Send/SendDirectMessage/senders/MediaSender';
import LargeDataUpload from '@utils/Messaging/LargeData/LargeDataUpload';
import {LargeDataParams} from '@utils/Messaging/interfaces';

type Props = NativeStackScreenProps<AppStackParamList, 'ForwardToContact'>;

const ForwardToContact = ({route, navigation}: Props) => {
  const {messages = [], chatId} = route.params;
  //for loader used in the screen
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMembers, setSelectedMembers] = useState<ConnectionInfo[]>([]);
  const [allMembers, setAllMembers] = useState<ConnectionInfo[]>([]);
  const [viewableMembers, setViewableMembers] = useState<ConnectionInfo[]>([]);

  const [isSearchActive, setIsSearchActive] = useState(false);
  //search text
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    (async () => {
      const connections = await getConnections();
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
            const mediaData = msg.data as LargeDataParams;
            const uploader = new LargeDataUpload(
              mediaData.fileUri || 'Bad file uri',
              mediaData.fileName,
              'unused filetype',
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

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={PortColors.primary.white}
      />
      <SafeAreaView style={styles.screen}>
        {isSearchActive ? (
          <View style={styles.barWrapper}>
            <SearchBar
              setIsSearchActive={setIsSearchActive}
              searchText={searchText}
              setSearchText={setSearchText}
            />
          </View>
        ) : (
          <SimpleTopbar
            IconRight={SearchIcon}
            onIconRightPress={() => setIsSearchActive(p => !p)}
            IconLeft={BackIcon}
            onIconLeftPress={() => navigation.goBack()}
            heading={
              selectedMembers.length > 0
                ? `Selected ${selectedMembers?.length}`
                : 'Select chats'
            }
          />
        )}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    width: screen.width,
    backgroundColor: PortColors.background,
  },
  scrollViewContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingHorizontal: PortSpacing.secondary.uniform,
  },
  barWrapper: {
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PortColors.primary.white,
    borderBottomColor: '#EEE',
    borderBottomWidth: 0.5,
    height: TOPBAR_HEIGHT,
  },
  buttonWrapper: {
    paddingVertical: PortSpacing.secondary.top,
  },
});

export default ForwardToContact;
