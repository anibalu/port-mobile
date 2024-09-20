import {PortColors, PortSpacing, screen} from '@components/ComponentUtils';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import GreenTick from '@assets/icons/GreenTick.svg';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from '@components/SafeAreaView';
import {CustomStatusBar} from '@components/CustomStatusBar';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import PopupBottomsheet from '@components/Reusable/BottomSheets/DualActionBottomSheet';
import {cleanDeleteMessage} from '@utils/Storage/messages';
import {cleanDeleteGroupMessage} from '@utils/Storage/groupMessages';
import Share from 'react-native-share';
import {MediaMessageActionsBar} from '@components/ActionBars/MediaMessageActionsBar';
import {useNavigation} from '@react-navigation/native';
import BackTopbarWithSubtitle from '@components/Reusable/TopBars/BackTopbarWithSubtitle';
import {getTimeAndDateStamp} from '@utils/Time';
import DirectChat from '@utils/DirectChats/DirectChat';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import ImageView from '@components/ImageView';
import VideoView from '@components/VideoView';
import DynamicColors from '@components/DynamicColors';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {ToastType, useToast} from 'src/context/ToastContext';
import {DEFAULT_GROUP_MEMBER_NAME, DEFAULT_NAME} from '@configs/constants';
import Group from '@utils/Groups/Group';
import {GroupMessageData} from '@utils/Storage/DBCalls/groupMessage';

type Props = NativeStackScreenProps<AppStackParamList, 'MediaViewer'>;

const MediaViewer = ({route}: Props) => {
  const {isGroup, message} = route.params;
  const fileUri = getSafeAbsoluteURI(message.data?.fileUri, 'doc');
  const attachedText = message.data?.text || '';
  const [owner, setOwner] = useState(
    isGroup ? DEFAULT_GROUP_MEMBER_NAME : DEFAULT_NAME,
  );
  const time = getTimeAndDateStamp(message.timestamp);
  const [showSuccessDownloaded, setShowSuccessDownloaded] = useState(false);
  const {showToast} = useToast();

  const getPhotoOwner = async () => {
    if (message.sender) {
      return 'You';
    } else {
      if (isGroup) {
        const newMessage = message as GroupMessageData;
        const dataHandler = new Group(newMessage.chatId);
        let name = null;
        if (newMessage.memberId) {
          name = (await dataHandler.getMember(newMessage.memberId))?.name;
        }
        return name || DEFAULT_GROUP_MEMBER_NAME;
      } else {
        const dataHandler = new DirectChat(message.chatId);
        const name = (await dataHandler.getChatData()).name;
        return name || DEFAULT_NAME;
      }
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
    const deleter = isGroup ? cleanDeleteGroupMessage : cleanDeleteMessage;
    await deleter(message.chatId, message.messageId, true);
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
      showToast(
        'Unable to share link. Please try again when online.',
        ToastType.error,
      );
      console.error('Error sharing content: ', error);
    }
  };

  const Colors = DynamicColors();

  const handleSave = async () => {
    const isPhoto = message.contentType === ContentType.image;
    try {
      await CameraRoll.saveAsset(fileUri, {type: isPhoto ? 'photo' : 'video'});
      setShowSuccessDownloaded(true);
    } catch (error) {
      console.log('Error downloading content', error);
      setShowSuccessDownloaded(false);
    }
  };
  useEffect(() => {
    //   to make the view disappear in 1.5 seconds
    const timer = setTimeout(() => {
      setShowSuccessDownloaded(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [showSuccessDownloaded]);

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
        {showSuccessDownloaded && (
          <View style={styles.successDownload}>
            <GreenTick style={{marginRight: 12}} />
            <NumberlessText
              style={{color: PortColors.primary.black}}
              fontType={FontType.rg}
              fontSizeType={FontSizeType.s}>
              Media has been downloaded to your gallery
            </NumberlessText>
          </View>
        )}

        <MediaMessageActionsBar
          handleSave={handleSave}
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
  successDownload: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: PortSpacing.secondary.uniform,
    paddingVertical: PortSpacing.tertiary.uniform,
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
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
