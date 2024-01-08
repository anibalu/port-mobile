import Send from '@assets/icons/NewSend.svg';
import Whitecross from '@assets/icons/Whitecross.svg';
import Delete from '@assets/icons/Whitedelete.svg';
import {PortColors, isIOS, screen} from '@components/ComponentUtils';
import {GenericButton} from '@components/GenericButton';
import GenericInput from '@components/GenericInput';
import {NumberlessMediumText} from '@components/NumberlessText';
import {AppStackParamList} from '@navigation/AppStackTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ConnectionInfo} from '@utils/Connections/interfaces';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {ContentType} from '@utils/Messaging/interfaces';
import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {createThumbnail} from 'react-native-create-thumbnail';
import Pdf from 'react-native-pdf';
import Carousel from 'react-native-snap-carousel';

type Props = NativeStackScreenProps<AppStackParamList, 'GalleryConfirmation'>;

const GalleryConfirmation = ({navigation, route}: Props) => {
  const {selectedMembers, shareMessages, isChat = false} = route.params;
  const carousel = useRef<any>();
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setSending] = useState(false);
  const [dataList, setDataList] = useState<any[]>(shareMessages);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [message, setMessage] = useState<string>('');

  // On receiving messages, we need to generate thumbnails if videos
  useEffect(() => {
    handleThumbnailGeneration();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThumbnailGeneration = async (): Promise<void> => {
    const newList = [];
    for (let item of dataList) {
      if (item.contentType === ContentType.video) {
        item.thumbnailUri = (
          await createThumbnail({
            url: item.data.fileUri,
            timeStamp: 0,
          })
        ).path;
      }
      newList.push(item);
    }
    setDataList(newList);
  };

  const renderCarouselItem = ({item, index}: {item: any; index: number}) => {
    return item.contentType === ContentType.image ? (
      <Image
        key={index}
        style={{flex: 1}}
        resizeMode="contain"
        source={{uri: item.data.fileUri}}
      />
    ) : item.contentType === ContentType.video ? (
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
    ) : (
      <>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            top: 10,
          }}>
          <NumberlessMediumText style={styles.pdfname}>
            {item.data.fileName}
          </NumberlessMediumText>
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
    return (
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
              setDataList(oldList =>
                oldList.filter(
                  oldItem => oldItem.data.fileUri != item.data.fileUri,
                ),
              );
            }}
            style={{
              position: 'absolute',
              left: 15,
              top: 15,
              backgroundColor: PortColors.primary.black,
              opacity: 0.5,
              paddingVertical: 4,
              paddingHorizontal: 6,
              borderRadius: 4,
            }}>
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
        const sender = new SendMessage(mbr.chatId, data.contentType, data.data);
        await sender.send();
      }
    }
    setSending(false);
    if (isChat) {
      navigation.goBack();
    } else {
      navigation.popToTop();
    }
  };

  const renderMembers = ({item}: {item: ConnectionInfo}) => {
    return (
      <View style={styles.item}>
        <NumberlessMediumText style={styles.itemtext} numberOfLines={1}>
          {item.name}
        </NumberlessMediumText>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={isIOS ? 'padding' : 'height'}
      keyboardVerticalOffset={isIOS ? 54 : undefined}
      style={styles.screen}>
      <Whitecross
        style={{position: 'absolute', zIndex: 10, top: 50, left: 20}}
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

      <FlatList
        data={dataList}
        horizontal={true}
        scrollEnabled={true}
        contentContainerStyle={{paddingHorizontal: 6}}
        style={styles.imagescroll}
        renderItem={renderThumbnails}
      />
      <View
        style={StyleSheet.compose(
          styles.bottombar,
          isChat && {
            backgroundColor: PortColors.primary.black,
          },
        )}>
        {isChat ? (
          <GenericInput
            inputStyle={styles.messageInputStyle}
            text={message}
            size="sm"
            maxLength={'inf'}
            multiline={true}
            setText={setMessage}
            placeholder={isFocused ? '' : 'Type your message here'}
            alignment="left"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        ) : (
          <FlatList
            data={selectedMembers}
            horizontal={true}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            keyExtractor={item => item.chatId}
            renderItem={renderMembers}
          />
        )}

        <GenericButton
          onPress={onSend}
          IconLeft={Send}
          loading={isSending}
          buttonStyle={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: PortColors.primary.black,
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
    maxHeight: 110,
    width: screen.width,
    backgroundColor: PortColors.primary.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 15,
    paddingLeft: 15,
  },
  imagescroll: {
    position: 'absolute',
    bottom: 90,
    paddingVertical: 10,
    backgroundColor: PortColors.primary.black,
    width: screen.width,
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
    width: screen.width - 72,
    minHeight: 50,
    maxHeight: 110,
    height: undefined,
    backgroundColor: PortColors.primary.white,
    borderRadius: 24,
    color: PortColors.text.primary,
    overflow: 'hidden',
    paddingRight: 5,
    paddingLeft: 20,
    ...(isIOS && {paddingTop: 15}),
    marginRight: 10,
  },
  itemtext: {
    fontSize: 12,
    color: PortColors.primary.grey.dark,
  },
  button: {
    alignItems: 'flex-end',
    marginRight: 15,
  },
  bottomimageContainer: {
    marginRight: 10,
    borderRadius: 8,
  },
  selectedImageContainer: {
    borderColor: PortColors.primary.blue.app,
    marginRight: 10,
    borderWidth: 4,
    borderRadius: 8,
  },
  bottomImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
});

export default GalleryConfirmation;
