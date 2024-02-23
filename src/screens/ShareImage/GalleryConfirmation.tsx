import Send from '@assets/icons/WhiteArrowUp.svg';
import Whitecross from '@assets/icons/Whitecross.svg';
import Delete from '@assets/icons/Whitedelete.svg';
import Play from '@assets/icons/videoPlay.svg';
import {PortColors, isIOS, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import GenericInput from '@components/GenericInput';
import DirectChat from '@utils/DirectChats/DirectChat';
import BlackOverlay from '@assets/miscellaneous/blackOverlay.svg';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  compressImage,
  compressVideo,
} from '@utils/Compressor/graphicCompressors';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import {ContentType} from '@utils/Messaging/interfaces';
import {
  getRelativeURI,
  moveToLargeFileDir,
} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {createThumbnail} from 'react-native-create-thumbnail';
import FileViewer from 'react-native-file-viewer';
import Pdf from 'react-native-pdf';
import Carousel from 'react-native-snap-carousel';
import {useErrorModal} from 'src/context/ErrorModalContext';
import useKeyboardVisibility from '../../utils/Hooks/useKeyboardVisibility';
import Group from '@utils/Groups/Group';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {GroupMemberStrict} from '@utils/Groups/interfaces';

type Props = NativeStackScreenProps<AppStackParamList, 'GalleryConfirmation'>;

const GalleryConfirmation = ({navigation, route}: Props) => {
  const {
    selectedMembers,
    shareMessages,
    isChat = false,
    isGroupChat,
  } = route.params;

  const carousel = useRef<any>();
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setSending] = useState(false);
  const [dataList, setDataList] = useState<any[]>(shareMessages);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const isKeyboardVisible = useKeyboardVisibility();
  const [userNameInDM, setUserNameInDM] = useState('');
  const [groupMembers, setGroupMembers] = useState<GroupMemberStrict[]>([]);

  const {compressionError} = useErrorModal();

  // On receiving messages, we need to generate thumbnails if videos
  useEffect(() => {
    preprocessMedia();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preprocessMedia = async () => {
    setLoading(true);
    const newList = [];
    for (let item of dataList) {
      if (item.contentType === ContentType.video) {
        const compressedUri = await compressVideo(
          item.data.fileUri,
          compressionError,
        );
        item.data.fileUri = compressedUri ? compressedUri : item.data.fileUri;
        item.thumbnailUri = (
          await createThumbnail({
            url: item.data.fileUri,
            timeStamp: 0,
          })
        ).path;
        console.log();
      }
      if (item.contentType === ContentType.image) {
        const compressedUri = await compressImage(
          item.data.fileUri,
          compressionError,
        );
        item.data.fileUri = compressedUri ? compressedUri : item.data.fileUri;
      }
      newList.push(item);
    }
    setDataList(newList);
    setLoading(false);
  };

  const renderItemTile = ({
    item,
  }: {
    item: ConnectionInfo | GroupMemberStrict;
  }) => {
    return (
      <NumberlessText
        fontSizeType={FontSizeType.s}
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          padding: 10,
          borderRadius: 11,
          overflow: 'hidden',
          textAlign: 'center',
          backgroundColor: PortColors.text.backgroundGrey,
        }}
        textColor={PortColors.text.primaryWhite}
        fontType={FontType.sb}>
        {item.name}
      </NumberlessText>
    );
  };

  const renderCarouselItem = ({item, index}: {item: any; index: number}) => {
    return loading ? (
      <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
        <ActivityIndicator size={'large'} />
      </View>
    ) : item.contentType === ContentType.image ? (
      <Image
        key={index}
        style={{flex: 1}}
        resizeMode="contain"
        source={{uri: item.data.fileUri}}
      />
    ) : item.contentType === ContentType.video ? (
      <Pressable
        style={{flex: 1}}
        onPress={() => {
          onVideoPressed(item.data.fileUri);
        }}>
        <Image
          key={index}
          resizeMode="contain"
          style={{
            flex: 1,
          }}
          source={{
            uri: item.thumbnailUri,
          }}
        />
        <Play
          style={{
            position: 'absolute',
            top: 0.34 * screen.height,
            left: 0.4 * screen.width,
          }}
        />
      </Pressable>
    ) : (
      <>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            top: 60,
            zIndex: 10,
            maxWidth: '70%',
          }}>
          <NumberlessText
            fontSizeType={FontSizeType.l}
            fontType={FontType.sb}
            numberOfLines={1}
            textColor={PortColors.primary.white}>
            {item.data.fileName}
          </NumberlessText>
        </View>

        <Pdf
          key={index}
          source={{uri: item.data.fileUri}}
          trustAllCerts={false}
          style={styles.pdf}
          singlePage={true}
        />
      </>
    );
  };

  const renderThumbnails = ({item, index}: {item: any; index: number}) => {
    return loading ? (
      <View style={{height: 60, width: 60}}>
        <ActivityIndicator size={'small'} />
      </View>
    ) : (
      <Pressable
        key={index}
        onPress={() => {
          carousel?.current?.snapToItem(index);
        }}
        style={
          activeIndex === index
            ? styles.selectedImageContainer
            : styles.bottomimageContainer
        }>
        {item.contentType === ContentType.file ? (
          <Pdf
            source={{uri: item.data.fileUri}}
            trustAllCerts={false}
            style={styles.bottomImage}
            singlePage={true}
          />
        ) : (
          <Image
            style={styles.bottomImage}
            source={{
              uri: item.thumbnailUri ? item.thumbnailUri : item.data.fileUri,
            }}
          />
        )}

        {activeIndex === index && (
          <Pressable
            onPress={() => {
              if (dataList.length <= 1) {
                navigation.goBack();
              }
              setDataList(oldList =>
                oldList.filter(
                  oldItem => oldItem.data.fileUri != item.data.fileUri,
                ),
              );
            }}
            style={{
              position: 'absolute',
              left: 12,
              top: 14,
              paddingHorizontal: 6,
              borderRadius: 4,
            }}>
            <View style={styles.buttonShadowContainer} />
            <Delete />
          </Pressable>
        )}
      </Pressable>
    );
  };

  const onSend = async () => {
    setSending(true);
    for (const mbr of selectedMembers) {
      for (const data of dataList) {
        //If there are multiple messages and this has entered from chat, attach text to the last image that is sent.
        if (isChat && dataList.indexOf(data) === dataList.length - 1) {
          data.data.text = message;
        }
        if (data.contentType === ContentType.video) {
          data.data.previewUri = getRelativeURI(data.thumbnailUri, 'cache');
        }
        const newData = {
          ...data.data,
          fileUri: await moveToLargeFileDir(
            mbr.chatId,
            data.data.fileUri,
            data.data.fileName,
            data.contentType,
          ),
        };

        const sender = new SendMessage(mbr.chatId, data.contentType, newData);
        sender.send();
      }
    }
    setSending(false);
    if (isChat) {
      navigation.goBack();
    } else {
      navigation.popToTop();
    }
  };

  const groupHandler = useMemo(() => {
    return new Group(selectedMembers[0].chatId);
  }, [selectedMembers]);

  useEffect(() => {
    (async () => {
      const membersInGroup = await groupHandler.getMembers();
      setGroupMembers(membersInGroup);
    })();
  }, [groupHandler]);

  const dataHandler = useMemo(() => {
    return isChat && new DirectChat(selectedMembers[0].chatId);
  }, [isChat, selectedMembers]);

  useEffect(() => {
    if (selectedMembers.length <= 1 && isChat) {
      (async () => {
        const chatData = await (dataHandler as DirectChat).getChatData();
        setUserNameInDM(chatData.name);
      })();
    }
  }, [dataHandler, isChat, selectedMembers]);

  return (
    <View style={styles.screen}>
      <Whitecross
        style={styles.whiteCrossIcon}
        disabled={isSending}
        onPress={() => navigation.goBack()}
      />

      <Carousel
        layout="default"
        ref={carousel}
        data={dataList}
        onSnapToItem={(index: number) => setActiveIndex(index)}
        sliderWidth={screen.width}
        itemWidth={screen.width}
        renderItem={renderCarouselItem}
      />

      {!isKeyboardVisible && dataList.length > 1 && (
        <FlatList
          data={dataList}
          horizontal={true}
          scrollEnabled={true}
          contentContainerStyle={{paddingHorizontal: 12}}
          style={styles.imagescroll}
          renderItem={renderThumbnails}
        />
      )}
      <KeyboardAvoidingView
        behavior={isIOS ? 'padding' : 'height'}
        keyboardVerticalOffset={isIOS ? 54 : undefined}
        style={StyleSheet.compose(
          styles.bottombar,
          isChat && {
            backgroundColor: PortColors.primary.black,
          },
        )}>
        <GenericInput
          inputStyle={styles.messageInputStyle}
          text={message}
          size="sm"
          maxLength={'inf'}
          multiline={true}
          setText={setMessage}
          placeholder={isFocused ? '' : 'Add a message'}
          alignment="left"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <View style={styles.bottombarUserPills}>
          <View style={styles.bottomUserPillsBg} />
          <View style={styles.selectedUserContainer}>
            {isGroupChat && groupMembers.length >= 1 ? (
              <FlatList
                data={groupMembers}
                horizontal={true}
                contentContainerStyle={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  columnGap: 8,
                }}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={true}
                keyExtractor={item => item.memberId}
                renderItem={renderItemTile}
              />
            ) : selectedMembers.length >= 1 && !isChat ? (
              <FlatList
                data={selectedMembers}
                horizontal={true}
                contentContainerStyle={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  columnGap: 8,
                }}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={true}
                keyExtractor={item => item.chatId}
                renderItem={renderItemTile}
              />
            ) : (
              <NumberlessText
                fontSizeType={FontSizeType.s}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  padding: 10,
                  borderRadius: 11,
                  overflow: 'hidden',
                  textAlign: 'center',
                  backgroundColor: PortColors.text.backgroundGrey,
                }}
                textColor={PortColors.text.primaryWhite}
                fontType={FontType.sb}>
                {userNameInDM}
              </NumberlessText>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0,
            }}>
            <BlackOverlay style={{position: 'absolute', right: -16}} />

            <GenericButton
              onPress={onSend}
              disabled={message.length < 0}
              iconSizeRight={14}
              IconRight={Send}
              loading={isSending || loading}
              buttonStyle={styles.button}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const onVideoPressed = (uri: string) => {
  FileViewer.open(uri, {
    showOpenWithDialog: true,
  });
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: PortColors.primary.black,
  },
  whiteCrossIcon: {
    position: 'absolute',
    zIndex: 10,
    top: 42,
    left: 18,
  },
  pdfname: {
    color: PortColors.primary.white,
  },
  pdf: {
    backgroundColor: PortColors.primary.black,
    width: screen.width,
    height: screen.height - 130,
  },
  bottombar: {
    marginHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'column',
    gap: 3,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 8,
    borderRadius: 24,
    borderWidth: 0.5,
  },
  bottombarUserPills: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 60,
  },
  selectedUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    columnGap: 8,
    ...(isIOS && {paddingHorizontal: 3}),
  },
  bottomUserPillsBg: {
    position: 'absolute',
    paddingVertical: 4,
    top: 0,
    left: -16,
    backgroundColor: PortColors.primary.black,
    opacity: 0.2,
    height: 100,
    width: screen.width + 16,
  },
  imagescroll: {
    maxHeight: 70,
    paddingVertical: 4,
    width: screen.width,
    marginBottom: 8,
  },
  item: {
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: PortColors.primary.grey.light,
    paddingVertical: 10,
    justifyContent: 'center',
    marginRight: 10,
  },
  messageInputStyle: {
    borderRadius: 24,
    maxHeight: 110,
    height: undefined,
    minHeight: 40,
    backgroundColor: PortColors.text.primary,
    borderWidth: 0.5,
    borderColor: PortColors.text.backgroundGrey,
    color: PortColors.text.primaryWhite,
    ...(!isIOS && {paddingBottom: 0, paddingTop: 0}),
    overflow: 'hidden',
    alignSelf: 'stretch',
    paddingHorizontal: 24,
    justifyContent: 'center',
    ...(isIOS && {paddingTop: 12, paddingBottom: 10, paddingLeft: 16}),
  },
  itemtext: {
    color: PortColors.primary.grey.dark,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#547CEF',
  },
  bottomimageContainer: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedImageContainer: {
    borderColor: PortColors.primary.blue.app,
    marginRight: 8,
    borderWidth: 4,
    overflow: 'hidden',
    borderRadius: 8,
    width: 60,
    height: 60,
  },
  buttonShadowContainer: {
    position: 'absolute',
    left: -15,
    top: -15,
    height: 60,
    width: 60,
    backgroundColor: PortColors.primary.black,
    opacity: 0.3,
  },
  bottomImage: {
    width: 60,
    height: 60,
  },
});

export default GalleryConfirmation;
