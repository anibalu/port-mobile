import {PortColors, screen} from '@components/ComponentUtils';
import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from '@components/SafeAreaView';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import PopupBottomsheet from '@components/Reusable/BottomSheets/DualActionBottomSheet';
import {cleanDeleteMessage} from '@utils/Storage/messages';
import Share from 'react-native-share';
import {MediaMessageActionsBar} from '@components/ActionBars/MediaMessageActionsBar';
import {useNavigation} from '@react-navigation/native';
import BackTopbarWithSubtitle from '@components/Reusable/TopBars/BackTopbarWithSubtitle';
import {getTimeAndDateStamp} from '@utils/Time';
import DirectChat from '@utils/DirectChats/DirectChat';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import {useErrorModal} from 'src/context/ErrorModalContext';
import ImageView from '@components/ImageView';
import VideoView from '@components/VideoView';
import DynamicColors from '@components/DynamicColors';

type Props = NativeStackScreenProps<AppStackParamList, 'MediaViewer'>;

const MediaViewer = ({route}: Props) => {
  const {message} = route.params;
  const fileUri = getSafeAbsoluteURI(message.data?.fileUri, 'doc');
  const attachedText = message.data?.text || '';
  const [owner, setOwner] = useState('New Contact');
  const time = getTimeAndDateStamp(message.timestamp);
  const {unableToSharelinkError} = useErrorModal();

  const getPhotoOwner = async () => {
    if (message.sender) {
      return 'You';
    } else {
      const dataHandler = new DirectChat(message.chatId);
      const name = (await dataHandler.getChatData()).name;
      return name;
    }
  };

  useEffect(() => {
    (async () => {
      setOwner(await getPhotoOwner());
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigation = useNavigation();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [showDeleteForEveryone, setShowDeleteForEveryone] = useState(false);
  const determineDeleteModalDisplay = async () => {
    setOpenDeleteModal(true);
    let senderExists = true;
    if (message && !message.sender) {
      senderExists = false;
    }
    setShowDeleteForEveryone(senderExists);
    return senderExists; // Return whether to show delete for everyone or not
  };

  const performDelete = async (): Promise<void> => {
    await cleanDeleteMessage(message.chatId, message.messageId, true);
    setOpenDeleteModal(false);
    navigation.goBack();
  };

  const performGlobalDelete = async (): Promise<void> => {
    const sender = new SendMessage(message.chatId, ContentType.deleted, {
      messageIdToDelete: message.messageId,
    });
    await sender.send();
    setOpenDeleteModal(false);
    navigation.goBack();
  };

  const handleShare = async () => {
    const uriFilePath = getSafeAbsoluteURI(message?.data?.fileUri, 'doc');

    try {
      const shareOptions: any = {
        url: uriFilePath,
        failOnCancel: false,
      };
      await Share.open(shareOptions);
    } catch (error) {
      unableToSharelinkError();
      console.error('Error sharing content: ', error);
    }
  };

  const Colors = DynamicColors();

  return (
    <>
      <CustomStatusBar
        barStyle="dark-content"
        backgroundColor={Colors.primary.surface}
      />

      <SafeAreaView style={styles.container}>
        <BackTopbarWithSubtitle
          onBackPress={() => navigation.goBack()}
          bgColor="w"
          title={`${owner}`}
          subtitle={time}
        />
        {message.contentType === ContentType.image ? (
          <ImageView fileUri={fileUri} attachedText={attachedText} />
        ) : (
          <VideoView fileUri={fileUri} attachedText={attachedText} />
        )}

        <MediaMessageActionsBar
          handleShare={handleShare}
          determineDeleteModalDisplay={determineDeleteModalDisplay}
        />
        <PopupBottomsheet
          showMore={showDeleteForEveryone}
          openModal={openDeleteModal}
          title={'Delete message'}
          topButton={
            showDeleteForEveryone ? 'Delete for everyone' : 'Delete for me'
          }
          topButtonFunction={
            showDeleteForEveryone ? performGlobalDelete : performDelete
          }
          middleButton="Delete for me"
          middleButtonFunction={performDelete}
          onClose={() => {
            setOpenDeleteModal(false);
          }}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: PortColors.primary.black,
  },
  imageitem: {
    flex: 1,
    width: '100%',
  },

  gradientContainer: {
    position: 'absolute',
    bottom: 80,
    marginRight: 10,
    paddingLeft: 10,
    width: screen.width,
    paddingTop: 20,
    paddingBottom: 10,
    maxHeight: 250,
  },
});

export default MediaViewer;
