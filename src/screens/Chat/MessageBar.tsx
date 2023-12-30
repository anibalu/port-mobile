import FileIcon from '@assets/icons/File.svg';
import Send from '@assets/icons/NewSend.svg';
import Cross from '@assets/icons/cross.svg';
import {
  default as ImageIcon,
  default as VideoIcon,
} from '@assets/icons/image.svg';
import Plus from '@assets/icons/plus.svg';
import {FontSizes, isIOS, screen} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {extractMemberInfo} from '@utils/Groups';
import {ContentType, SavedMessageParams} from '@utils/Messaging/interfaces';
import {FileAttributes} from '@utils/Storage/sharedFile';
import React, {ReactNode, memo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {Asset, launchImageLibrary} from 'react-native-image-picker';

import {useNavigation} from '@react-navigation/native';
import SendMessage from '@utils/Messaging/Send/SendMessage';
import FileReplyContainer from './ReplyContainers/FileReplyContainer';
import ImageReplyContainer from './ReplyContainers/ImageReplyContainer';
import TextReplyContainer from './ReplyContainers/TextReplyContainer';
import VideoReplyContainer from './ReplyContainers/VideoReplyContainer';

/**
 * Renders the bottom input bar for a chat.
 * @param chatId , active chat
 * @param isGroupChat
 * @param replyTo, message being replied to
 * @param setReplyTo, setter for the same
 * @param name, name of the person being replied to
 * @param groupInfo
 * @param chatId
 * @returns {ReactNode}, message bar that handles all inputs
 */
const MessageBar = ({
  chatId,
  isGroupChat,
  replyTo,
  setReplyTo,
  name,
  groupInfo,
  onSend,
}: {
  chatId: string;
  replyTo: SavedMessageParams | undefined;
  setReplyTo: any;
  isGroupChat: boolean;
  name: string;
  groupInfo: any;
  onSend: any;
}): ReactNode => {
  const navigation = useNavigation();
  const inputTextBarWidth = screen.width - 126;
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isPopUpVisible, setPopUpVisible] = useState(false);

  const togglePopUp = (): void => {
    setPopUpVisible(!isPopUpVisible);
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

  const onImagePressed = async (): Promise<void> => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
      });
      //images are selected
      const selected: Asset[] = response.assets || [];
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].uri || '',
          fileType: selected[index].type || '',
          fileName: selected[index].fileName || '',
        };
        //image is sent
        setPopUpVisible(false);
        const sender = new SendMessage(chatId, ContentType.image, {...file});
        await sender.send();
      }
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  const onVideoPressed = async (): Promise<void> => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'video',
        includeBase64: false,
      });
      //videos are selected
      const selected: Asset[] = response.assets || [];
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].uri || '',
          fileType: selected[index].type || '',
          fileName: selected[index].fileName || '',
        };
        //video is sent
        setPopUpVisible(false);
        const sender = new SendMessage(chatId, ContentType.video, {...file});
        await sender.send();
      }
      //send media message
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };

  const onFilePressed = async (): Promise<void> => {
    try {
      const selected: DocumentPickerResponse[] = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      for (let index = 0; index < selected.length; index++) {
        const file: FileAttributes = {
          fileUri: selected[index].uri,
          fileType: selected[index].type || '',
          fileName: selected[index].name || '',
        };
        //file is sent
        setPopUpVisible(false);
        const sender = new SendMessage(chatId, ContentType.file, {...file});
        await sender.send();
      }
      //send file message
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={isIOS ? 'padding' : 'height'}
      keyboardVerticalOffset={isIOS ? 54 : undefined}
      style={styles.main}>
      {isPopUpVisible ? (
        <View style={styles.aggregateContainer}>
          <View style={styles.popUpContainer}>
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={onImagePressed}>
                <ImageIcon />
              </Pressable>
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.md}>
                Images
              </NumberlessText>
            </View>
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={onVideoPressed}>
                <VideoIcon />
              </Pressable>
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.md}>
                Videos
              </NumberlessText>
            </View>
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={onFilePressed}>
                <FileIcon />
              </Pressable>
              <NumberlessText
                fontSizeType={FontSizeType.s}
                fontType={FontType.md}>
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
                  <FileIcon />
                </Pressable>
                <NumberlessText
                  fontSizeType={FontSizeType.s}
                  fontType={FontType.md}>
                  Share Contact
                </NumberlessText>
              </View>
            )}
          </View>
          <View style={styles.textInputContainer}>
            <View style={styles.textInput}>
              <Pressable style={styles.plus} onPress={togglePopUp}>
                <Cross />
              </Pressable>
              <View style={{width: inputTextBarWidth}}>
                <View style={styles.textBox}>
                  <TextInput
                    style={styles.inputText}
                    multiline={true}
                    placeholder={isFocused ? '' : 'Type your message here'}
                    placeholderTextColor="#BABABA"
                    onChangeText={onChangeText}
                    value={text}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                </View>
              </View>
            </View>

            <Pressable style={styles.send} onPress={sendText}>
              <Send />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{flexDirection: 'column'}}>
          {replyTo ? (
            <View
              style={{
                backgroundColor: '#fff',
                width: '100%',
                paddingVertical: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  backgroundColor: '#f6f6f6',
                  borderRadius: 16,
                  width: '95%',
                  paddingVertical: 9,
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    width: 6,
                    marginLeft: 10,
                    borderRadius: 16,
                    height: '70%',
                    backgroundColor: !replyTo?.sender ? '#547CEF' : '#fff',
                  }}
                />
                <View
                  style={{
                    marginLeft: 11,
                    flexDirection: 'column',
                    width: '90%',
                  }}>
                  {renderReplyBar(replyTo, isGroupChat, groupInfo, name)}
                </View>
              </View>
              <Pressable
                onPress={() => setReplyTo(undefined)}
                style={{position: 'absolute', right: 17, top: 22}}>
                <Plus
                  style={{transform: [{rotate: '45deg'}], height: 6, width: 6}}
                />
              </Pressable>
            </View>
          ) : (
            <></>
          )}

          <View style={styles.textInputContainer}>
            <View style={styles.textInput}>
              <Pressable style={styles.plus} onPress={togglePopUp}>
                <Plus />
              </Pressable>
              <View style={{width: inputTextBarWidth}}>
                <View style={styles.textBox}>
                  <TextInput
                    style={StyleSheet.compose(
                      styles.inputText,
                      isIOS ? {paddingTop: 15} : {},
                    )}
                    multiline={true}
                    placeholder={isFocused ? '' : 'Type your message here'}
                    placeholderTextColor="#BABABA"
                    onChangeText={onChangeText}
                    value={text}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                </View>
              </View>
            </View>
            <Pressable style={styles.send} onPress={sendText}>
              <Send />
            </Pressable>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

function findMemberName(memberInfo: any) {
  if (memberInfo.memberId) {
    return memberInfo.name || DEFAULT_NAME;
  }
  return '';
}

function renderReplyBar(
  replyTo: SavedMessageParams,
  isGroupChat: boolean,
  groupInfo: any,
  name: string,
): ReactNode {
  switch (replyTo.contentType) {
    case ContentType.text: {
      return (
        <TextReplyContainer
          message={replyTo}
          memberName={
            !replyTo?.sender
              ? isGroupChat
                ? findMemberName(extractMemberInfo(groupInfo, replyTo.memberId))
                : name
              : 'You'
          }
        />
      );
    }
    case ContentType.image: {
      return (
        <ImageReplyContainer
          message={replyTo}
          memberName={
            !replyTo?.sender
              ? isGroupChat
                ? findMemberName(extractMemberInfo(groupInfo, replyTo.memberId))
                : name
              : 'You'
          }
        />
      );
    }
    case ContentType.file: {
      return (
        <FileReplyContainer
          message={replyTo}
          memberName={
            !replyTo?.sender
              ? isGroupChat
                ? findMemberName(extractMemberInfo(groupInfo, replyTo.memberId))
                : name
              : 'You'
          }
        />
      );
    }
    case ContentType.video: {
      return (
        <VideoReplyContainer
          message={replyTo}
          memberName={
            !replyTo?.sender
              ? isGroupChat
                ? findMemberName(extractMemberInfo(groupInfo, replyTo.memberId))
                : name
              : 'You'
          }
        />
      );
    }
  }
}

const styles = StyleSheet.create({
  main: {
    width: '100%',
    flexDirection: 'column',
    marginBottom: 15,
  },
  aggregateContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  popUpContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    paddingLeft: 30,
    paddingRight: 30,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 5,
    width: '95%',
    alignSelf: 'center',
  },
  textInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginLeft: 10,
    marginRight: 10,
  },
  textInput: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 34,
  },
  plus: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: '#F9F9F9',
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#547CEF',
  },
  textBox: {
    //height: 65,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  inputText: {
    width: '100%',
    maxHeight: 110,
    minHeight: 50,
    color: '#000000',
    ...FontSizes[15].regular,
    borderRadius: 8,
    paddingLeft: 5,
  },
  optionContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: 70,
    height: 100,
    marginLeft: 8,
  },
  optionBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    backgroundColor: '#F6F6F6',
  },
  optionText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default memo(MessageBar);
