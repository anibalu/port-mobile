import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  View,
  TextInput,
  Dimensions,
} from 'react-native';
import Send from '../../../assets/icons/NewSend.svg';
import Plus from '../../../assets/icons/plus.svg';
import Cross from '../../../assets/icons/cross.svg';
import ImageIcon from '../../../assets/icons/image.svg';
import VideoIcon from '../../../assets/icons/image.svg';
import FileIcon from '../../../assets/icons/File.svg';
import {wait} from '../../utils/Time';
import {NumberlessMediumText} from '../../components/NumberlessText';
import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import {FileAttributes} from '../../utils/Storage/sharedFile';
import {sendDirectMessage} from '../../utils/Messaging/sendDirectMessage';
import {ContentType, MessageType} from '../../utils/Messaging/interfaces';

export function MessageBar({chatId, flatlistRef, listLen}) {
  const viewWidth = Dimensions.get('window').width;
  const inputTextBarWidth = viewWidth - 126;
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isPopUpVisible, setPopUpVisible] = useState(false);

  const togglePopUp = () => {
    setPopUpVisible(!isPopUpVisible);
  };
  const onChangeText = (newText: string) => {
    setText(newText);
  };
  const onPressed = async () => {
    await wait(300);
    if (listLen > 1) {
      flatlistRef.current.scrollToEnd();
    }
  };
  const sendText = async () => {
    const processedText = text.trim();
    if (processedText !== '') {
      setText('');
      //send text message
      await sendDirectMessage(chatId, {
        contentType: ContentType.text,
        messageType: MessageType.new,
        data: {text: processedText},
      });
    }
  };
  const onImagePressed = async () => {
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
        console.log('file selected', file);
        //image is sent
        setPopUpVisible(false);
        await sendDirectMessage(chatId, {
          contentType: ContentType.image,
          messageType: MessageType.new,
          data: {...file},
        });
      }
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };
  const onVideoPressed = async () => {
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
        console.log('file selected', file);
        //video is sent
        setPopUpVisible(false);
        await sendDirectMessage(chatId, {
          contentType: ContentType.video,
          messageType: MessageType.new,
          data: {...file},
        });
      }
      //send media message
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };
  const onFilePressed = async () => {
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
        console.log('file selected', file);
        //file is sent
        setPopUpVisible(false);
        await sendDirectMessage(chatId, {
          contentType: ContentType.file,
          messageType: MessageType.new,
          data: {...file},
        });
      }
      //send file message
    } catch (error) {
      console.log('Nothing selected', error);
    }
  };
  return (
    <KeyboardAvoidingView style={styles.main}>
      {isPopUpVisible ? (
        <View style={styles.aggregateContainer}>
          <View style={styles.popUpContainer}>
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={onImagePressed}>
                <ImageIcon />
              </Pressable>
              <NumberlessMediumText style={styles.optionText}>
                Photos
              </NumberlessMediumText>
            </View>
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={onVideoPressed}>
                <VideoIcon />
              </Pressable>
              <NumberlessMediumText style={styles.optionText}>
                Videos
              </NumberlessMediumText>
            </View>
            <View style={styles.optionContainer}>
              <Pressable style={styles.optionBox} onPress={onFilePressed}>
                <FileIcon />
              </Pressable>
              <NumberlessMediumText style={styles.optionText}>
                Files
              </NumberlessMediumText>
            </View>
          </View>
          <View style={styles.textInputContainer}>
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
                  onPressIn={onPressed}
                />
              </View>
            </View>
            <Pressable style={styles.send} onPress={sendText}>
              <Send />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.textInputContainer}>
          <Pressable style={styles.plus} onPress={togglePopUp}>
            <Plus />
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
                onPressIn={onPressed}
              />
            </View>
          </View>
          <Pressable style={styles.send} onPress={sendText}>
            <Send />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  main: {
    width: '100%',
    flexDirection: 'column',
  },
  aggregateContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
  popUpContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 30,
    paddingRight: 30,
  },
  textInputContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    //height: 65,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingTop: 5,
    backgroundColor: '#FFFFFF',
  },
  plus: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#A3A3A3',
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
    color: '#000000',
    fontSize: 15,
    fontFamily: 'Rubik-Regular',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingLeft: 5,
  },
  optionContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  optionBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#547CEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  optionText: {
    fontSize: 12,
  },
});
