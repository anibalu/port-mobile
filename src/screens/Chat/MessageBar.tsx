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
import {DirectMessaging} from '../../utils/DirectMessaging';
import {wait} from '../../utils/wait';
import { trimWhiteSpace } from '../../utils/text';

export function MessageBar({
  flatlistRef,
  renderCount,
  setRenderCount,
  lineId,
  listLen,
}) {
  const viewWidth = Dimensions.get('window').width;
  const inputTextBarWidth = viewWidth - 73;
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const onChangeText = (newText: string) => {
    setText(newText);
  };
  const onPressed = async () => {
    await wait(300);
    if (listLen > 1) {
      flatlistRef.current.scrollToEnd();
    }
  };
  const messaging = new DirectMessaging(lineId);
  const sendText = async () => {
    const processedText = trimWhiteSpace(text);
    if (processedText !== '') {
      setText('');
      await messaging.sendMessage({
        messageId: messaging.generateMessageId(),
        messageType: 'text',
        data: {text: processedText},
      });
      setRenderCount(renderCount + 1);
    }
  };
  return (
    <KeyboardAvoidingView style={styles.main}>
      <View style={styles.container}>
        {/* <Pressable
          style={styles.plus}
          onPress={() => console.log('plus clicked')}>
          <Plus />
        </Pressable> */}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  main: {
    width: '100%',
    flexDirection: 'column',
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //height: 65,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  plus: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#A3A3A3',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingLeft: 10,
  },
});
