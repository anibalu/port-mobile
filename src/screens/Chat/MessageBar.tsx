import DefaultImage from '@assets/avatars/avatar.png';
import FileIcon from '@assets/icons/FilesIcon.svg';
import {default as ImageIcon} from '@assets/icons/GalleryIcon.svg';
import ShareContactIcon from '@assets/icons/ShareContactIcon.svg';
import VideoIcon from '@assets/icons/VideoBlack.svg';
import Send from '@assets/icons/WhiteArrowUp.svg';
import SendDisabled from '@assets/icons/WhiteArrowUpDisabled.svg';
import Plus from '@assets/icons/plus.svg';
import {PortColors, isIOS, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
  getWeight,
} from '@components/NumberlessText';
import {
  ContentType,
  LargeDataParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {FileAttributes} from '@utils/Storage/interfaces';
import React, {ReactNode, memo, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {Asset, launchImageLibrary} from 'react-native-image-picker';

import {GenericButton} from '@components/GenericButton';
import {DEFAULT_NAME} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';
import Group from '@utils/Groups/Group';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import {getSafeAbsoluteURI} from '@utils/Storage/StorageRNFS/sharedFileHandlers';
import FileReplyContainer from './ReplyContainers/FileReplyContainer';
import ImageReplyContainer from './ReplyContainers/ImageReplyContainer';
import TextReplyContainer from './ReplyContainers/TextReplyContainer';
import VideoReplyContainer from './ReplyContainers/VideoReplyContainer';

const MESSAGE_INPUT_TEXT_WIDTH = screen.width - 111;
/**
 * Renders the bottom input bar for a chat.
 * @param chatId , active chat
 * @param isGroupChat
 * @param replyTo, message being replied to
 * @param setReplyTo, setter for the same
 * @param name, name of the sender themselves
 * @param groupInfo
 * @param chatId
 * @returns {ReactNode}, message bar that handles all inputs
 */
const MessageBar = ({
  chatId,
  isGroupChat,
  replyTo,
  name,
  onSend,
}: {
  chatId: string;
  replyTo: SavedMessageParams | undefined;
  isGroupChat: boolean;
  name: string;
  onSend: any;
}): ReactNode => {
  const navigation = useNavigation<any>();
  const rotationValue = useRef(new Animated.Value(0)).current;

  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isPopUpVisible, setPopUpVisible] = useState(false);
  const groupHandler = isGroupChat ? new Group(chatId) : undefined;
  const [replyName, setReplyName] = useState<string | null | undefined>(
    DEFAULT_NAME,
  );
  const inputRef = useRef(null);

  const [replyImageUri, setReplyImageURI] = useState(
    Image.resolveAssetSource(DefaultImage).uri,
  );
  useEffect(() => {
    const reply = replyTo?.data as LargeDataParams;
    if (reply?.fileUri) {
      setReplyImageURI(getSafeAbsoluteURI(reply?.fileUri, 'doc'));
    }
    if (reply?.previewUri) {
      setReplyImageURI(getSafeAbsoluteURI(reply?.previewUri, 'cache'));
    }
    if (inputRef?.current && replyTo != undefined) {
      console.log('Calling focus');
      inputRef.current.focus();
    }
  }, [replyTo]);

  const togglePopUp = (): void => {
    setPopUpVisible(!isPopUpVisible);

    // Rotate animation
    Animated.timing(rotationValue, {
      toValue: isPopUpVisible ? 0 : 1,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: false, // false because 'rotate' is not supported by native driver
    }).start();
  };

  // Interpolate the rotation value to determine the degree of rotation
  const rotateInterpolation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const animatedStyle: Animated.AnimatedProps<ViewStyle> = {
    transform: [{rotate: rotateInterpolation}],
  };

  const onChangeText = (newText: string): void => {
    setText(newText);
  };

  const sendText = async (): Promise<void> => {
    const processedText = text.trim();
    if (processedText !== '') {
      setText('');
      //send text message
      onSend();
      const sender = new SendMessage(
        chatId,
        ContentType.text,
        {text: processedText},
        replyTo ? replyTo.messageId : null,
      );
      await sender.send();
    }
  };

  useEffect(() => {
    (async () => {
      //If the reply ID exists i.e replying to anyone apart from sende
      if (!replyTo?.sender) {
        //If it is a group, and there is a member to reply to.
        if (isGroupChat && groupHandler != undefined && replyTo?.memberId) {
          const repName = (await groupHandler.getMember(replyTo!.memberId!))
            ?.name;
          setReplyName(repName ? repName : DEFAULT_NAME);
        } else {
          setReplyName(name);
        }
      } else {
        setReplyName('You');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyTo]);

  const goToConfirmation = (lst: any[]) => {
    if (lst.length > 0) {
      navigation.navigate('GalleryConfirmation', {
        selectedMembers: [{chatId: chatId}],
        shareMessages: lst,
        isChat: true,
      });
    }
    togglePopUp();
  };

  const onImagePressed = async (): Promise<void> => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        selectionLimit: 6,
      });
      //images are selected
      const selected: Asset[] = response.assets || [];
      const fileList = [];
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].uri || '',
          fileType: selected[index].type || '',
          fileName: selected[index].fileName || '',
        };

        const msg = {
          contentType: ContentType.image,
          data: {...file},
        };
        fileList.push(msg);
      }
      goToConfirmation(fileList);
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  const onVideoPressed = async (): Promise<void> => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'video',
        includeBase64: false,
        selectionLimit: 6,
      });
      const fileList = [];
      //videos are selected
      const selected: Asset[] = response.assets || [];
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].uri || '',
          fileType: selected[index].type || '',
          fileName: selected[index].fileName || '',
        };
        //video is sent
        const msg = {
          contentType: ContentType.video,
          data: {...file},
        };
        fileList.push(msg);
      }
      goToConfirmation(fileList);
      //send media message
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  const onFilePressed = async (): Promise<void> => {
    try {
      const selected: DocumentPickerResponse[] = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.audio,
          DocumentPicker.types.csv,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.pdf,
          DocumentPicker.types.ppt,
          DocumentPicker.types.pptx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
          DocumentPicker.types.zip,
        ],
        //We need to copy documents to a directory locally before sharing on newer Android.
        ...(!isIOS && {copyTo: 'cachesDirectory'}),
      });
      const fileList = [];
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].fileCopyUri
            ? selected[index].fileCopyUri
            : selected[index].uri,
          fileType: selected[index].type || '',
          fileName: selected[index].name || '',
        };
        //file is sent
        const msg = {
          contentType: ContentType.file,
          data: {...file},
        };
        fileList.push(msg);
      }
      //send file message
      goToConfirmation(fileList);
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={isIOS ? 'padding' : 'height'}
      keyboardVerticalOffset={isIOS ? 50 : undefined}
      style={styles.main}>
      <View style={{flexDirection: 'column'}}>
        {replyTo ? (
          <View style={styles.replyContainerStyle}>
            <View style={styles.replyTextBackgroundContainer}>
              {/* Indicator bar for reply */}
              <View
                style={{
                  width: 4,
                  borderRadius: 2,
                  alignSelf: 'stretch',
                  backgroundColor: PortColors.primary.blue.app,
                }}
              />
              <View
                style={{
                  marginLeft: 12,
                  paddingRight: 8,
                  paddingVertical: 8,
                  minHeight: 50,
                  flex: 1,
                }}>
                {renderReplyBar(replyTo, replyName, replyImageUri)}
              </View>
              {(replyTo.contentType === ContentType.image ||
                replyTo.contentType === ContentType.video) && (
                <Image
                  source={{uri: replyImageUri}}
                  style={{
                    height: 75,
                    width: 70,
                    borderTopRightRadius: 16,
                    borderBottomRightRadius: 16,
                    position: 'absolute',
                    right: 0,
                  }}
                />
              )}
            </View>
            <Pressable
              onPress={onSend}
              style={{
                position: 'absolute',
                right: 17,
                top: 16,
                borderRadius: 12,
                backgroundColor: '#F2F2F2',
              }}>
              <Plus
                style={{transform: [{rotate: '45deg'}], height: 6, width: 6}}
              />
            </Pressable>
          </View>
        ) : (
          <></>
        )}

        <View style={styles.textInputContainer}>
          <View
            style={StyleSheet.compose(
              styles.textInput,
              replyTo ? {borderTopLeftRadius: 0, borderTopRightRadius: 0} : {},
            )}>
            <Animated.View style={[styles.plus, animatedStyle]}>
              <Pressable onPress={togglePopUp}>
                <Plus height={24} width={24} />
              </Pressable>
            </Animated.View>

            <View style={styles.textBox}>
              <TextInput
                style={StyleSheet.compose(styles.inputText, {
                  fontFamily: FontType.rg,
                  fontSize: FontSizeType.m,
                  fontWeight: getWeight(FontType.rg),
                })}
                ref={inputRef}
                textAlign="left"
                multiline
                placeholder={isFocused ? '' : 'Type your message here'}
                placeholderTextColor={PortColors.primary.grey.medium}
                onChangeText={onChangeText}
                value={text}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
          </View>
          <GenericButton
            disabled={text.length < 0}
            iconSizeRight={14}
            buttonStyle={styles.send}
            IconRight={text.length > 0 ? Send : SendDisabled}
            onPress={sendText}
          />
        </View>
      </View>
      {isPopUpVisible && (
        <View style={styles.popUpContainer}>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onImagePressed}>
              <ImageIcon />
            </Pressable>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Images
            </NumberlessText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onVideoPressed}>
              <VideoIcon />
            </Pressable>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Videos
            </NumberlessText>
          </View>
          <View style={styles.optionContainer}>
            <Pressable style={styles.optionBox} onPress={onFilePressed}>
              <FileIcon />
            </Pressable>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              Files
            </NumberlessText>
          </View>
          {!isGroupChat && (
            <View style={styles.optionContainer}>
              <Pressable
                style={styles.optionBox}
                onPress={() => {
                  navigation.navigate('ShareContact', {chatId: chatId});
                }}>
                <ShareContactIcon />
              </Pressable>
              <NumberlessText
                fontSizeType={FontSizeType.s}
                style={{textAlign: 'center'}}
                fontType={FontType.rg}>
                Contact
              </NumberlessText>
            </View>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

function renderReplyBar(
  replyTo: SavedMessageParams,
  replyName: string | null | undefined,
  URI: string,
): ReactNode {
  switch (replyTo.contentType) {
    case ContentType.text: {
      return <TextReplyContainer message={replyTo} memberName={replyName} />;
    }
    case ContentType.image: {
      return (
        <ImageReplyContainer
          message={replyTo}
          memberName={replyName}
          URI={URI}
        />
      );
    }
    case ContentType.file: {
      return (
        <FileReplyContainer
          message={replyTo}
          memberName={replyName}
          URI={URI}
        />
      );
    }
    case ContentType.video: {
      return (
        <VideoReplyContainer
          message={replyTo}
          memberName={replyName}
          URI={URI}
        />
      );
    }
  }
}

const styles = StyleSheet.create({
  main: {
    width: '100%',
    flexDirection: 'column',

    ...(isIOS && {marginBottom: 15}),
  },
  popUpContainer: {
    flexDirection: 'row',
    paddingTop: 20,
    paddingLeft: 24,
    paddingRight: 24,
    backgroundColor: '#FFF',
    borderRadius: 24,
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  replyTextBackgroundContainer: {
    backgroundColor: '#B7B6B64D',
    borderRadius: 16,
    alignSelf: 'stretch',

    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  textInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',

    marginHorizontal: 10,
    paddingBottom: 10,
  },
  replyContainerStyle: {
    backgroundColor: PortColors.primary.white,
    width: MESSAGE_INPUT_TEXT_WIDTH + 48,
    paddingTop: 8,
    paddingHorizontal: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: '#E5E5E5',
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'visible',
  },
  textInput: {
    flexDirection: 'row',
    backgroundColor: PortColors.primary.white,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 0.5,
    borderTopWidth: 0,
    borderColor: '#E5E5E5',
  },
  plus: {
    width: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 7,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#547CEF',
  },
  textBox: {
    width: MESSAGE_INPUT_TEXT_WIDTH,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  inputText: {
    width: '97%',
    maxHeight: 110,
    height: undefined,
    minHeight: 40,
    color: PortColors.text.primary,
    //Remove additional padding on Android
    ...(!isIOS && {paddingBottom: 0, paddingTop: 0}),
    overflow: 'hidden',
    alignSelf: 'stretch',
    paddingRight: 5,
    borderRadius: 0,
    justifyContent: 'center',
    backgroundColor: PortColors.primary.white,
    ...(isIOS && {paddingTop: 10, paddingBottom: 10, paddingLeft: 5}),
  },
  optionContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: 70,
    height: 100,
  },
  optionBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: '#F6F6F6',
  },
});

export default memo(MessageBar);
