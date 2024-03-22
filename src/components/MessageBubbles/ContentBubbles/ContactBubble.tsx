import {PortColors} from '@components/ComponentUtils';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';
import DirectChat from '@utils/DirectChats/DirectChat';
import {
  ContactBundleParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {getReadPort, processReadBundles, readBundle} from '@utils/Ports';
import {PortBundle} from '@utils/Ports/interfaces';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {
  MAX_WIDTH_CONTENT,
  RenderTimeStamp,
  TIME_STAMP_TEXT_PADDING_RECEIVER,
  TIME_STAMP_TEXT_PADDING_SENDER,
} from '../BubbleUtils';

enum ButtonState {
  undecided,
  connect,
  connecting,
  expired,
  message,
}

const ContactBubble = ({message}: {message: SavedMessageParams}) => {
  const paddingText = message.sender
    ? TIME_STAMP_TEXT_PADDING_SENDER
    : TIME_STAMP_TEXT_PADDING_RECEIVER;
  const navigation = useNavigation<any>();
  const [buttonType, setButtonType] = useState<ButtonState>(
    ButtonState.undecided,
  );
  const [accepted, setAccepted] = useState<boolean | undefined>(undefined);
  const [goToChatId, setGoToChatId] = useState<string | undefined>(undefined);
  const [chatName, setChatName] = useState<string>(
    (message.data as ContactBundleParams).name || DEFAULT_NAME,
  );
  const handleConnect = async () => {
    try {
      if (goToChatId) {
        const chat = new DirectChat(goToChatId);
        const chatData = await chat.getChatData();
        if (chatData.authenticated) {
          navigation.push('DirectChat', {
            chatId: goToChatId,
            isGroupChat: false,
            isConnected: !chatData.disconnected,
          });
        }
      } else {
        const bundle: PortBundle = message.data as ContactBundleParams;
        const channel =
          'shared://' + message.chatId + '://' + message.messageId;
        if (bundle) {
          await readBundle(bundle, channel);
          //try to use read bundles
          await processReadBundles();
          //navigate to home screen
          navigation.navigate('HomeTab');
        } else {
          throw new Error('No Bundle');
        }
      }
    } catch (error) {
      console.log('Error connecting over shared contact', error);
    }
  };
  const setButtonState = async () => {
    try {
      if (!accepted && !goToChatId) {
        setButtonType(ButtonState.connect);
        return;
      }
      if (goToChatId) {
        const chat = new DirectChat(goToChatId);
        const chatData = await chat.getChatData();
        setChatName(chatData.name);
        if (chatData.authenticated) {
          setButtonType(ButtonState.message);
        } else {
          setButtonType(ButtonState.connecting);
        }
        return;
      }
      const getBundle = await getReadPort(
        (message.data as ContactBundleParams).portId,
      );
      if (getBundle && accepted) {
        setButtonType(ButtonState.connecting);
        return;
      }
      setButtonType(ButtonState.expired);
      return;
    } catch (error) {
      setButtonType(ButtonState.expired);
      return;
    }
  };

  //handles navigation to a chat screen and toggles chat to read.
  const handleNavigate = async (): Promise<void> => {
    if ((message.data as ContactBundleParams).goToChatId) {
      const chat = new DirectChat(
        (message.data as ContactBundleParams).goToChatId,
      );
      const chatData = await chat.getChatData();
      if (chatData.authenticated) {
        navigation.push('DirectChat', {
          chatId: goToChatId,
          isGroupChat: false,
          isConnected: !chatData.disconnected,
        });
      }
    }
  };

  useEffect(() => {
    setAccepted((message.data as ContactBundleParams).accepted);
    setGoToChatId((message.data as ContactBundleParams).goToChatId);
  }, [message]);
  useEffect(() => {
    setButtonState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accepted, goToChatId]);

  return (
    <View style={{width: MAX_WIDTH_CONTENT - 16}}>
      <View
        style={{
          width: MAX_WIDTH_CONTENT - 16,
        }}>
        <View style={styles.timeStampContainer}>
          <NumberlessText fontSizeType={FontSizeType.m} fontType={FontType.md}>
            {chatName}
          </NumberlessText>
          <NumberlessText
            textColor={PortColors.subtitle}
            fontSizeType={FontSizeType.s}
            fontType={FontType.rg}>
            {message.sender
              ? `${'You have shared the contact of ' + chatName + paddingText}`
              : `${
                  'You have been shared the contact of ' +
                  chatName +
                  paddingText
                }`}
          </NumberlessText>
        </View>
        <View style={{position: 'absolute', right: 4, bottom: 4}}>
          <RenderTimeStamp message={message} />
        </View>
      </View>
      {message.sender ? (
        <Pressable onPress={handleNavigate} style={styles.messageStyle}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}
            textColor={PortColors.text.primaryWhite}>
            Message
          </NumberlessText>
        </Pressable>
      ) : (
        <GetButton clickHandle={handleConnect} buttonState={buttonType} />
      )}
    </View>
  );
};

function GetButton({
  buttonState,
  clickHandle,
}: {
  buttonState: ButtonState;
  clickHandle: () => void;
}) {
  switch (buttonState) {
    case ButtonState.connect:
      return (
        <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}
            textColor={PortColors.text.primaryWhite}>
            Connect
          </NumberlessText>
        </Pressable>
      );
    case ButtonState.connecting:
      return (
        <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}
            textColor={PortColors.text.primaryWhite}>
            Connecting...
          </NumberlessText>
        </Pressable>
      );
    case ButtonState.expired:
      return (
        <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}
            textColor={PortColors.text.primaryWhite}>
            Expired
          </NumberlessText>
        </Pressable>
      );
    case ButtonState.undecided:
      return (
        <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}
            textColor={PortColors.text.primaryWhite}>
            Expired
          </NumberlessText>
        </Pressable>
      );
    case ButtonState.message:
      return (
        <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}
            textColor={PortColors.text.primaryWhite}>
            Message
          </NumberlessText>
        </Pressable>
      );
    default:
      return (
        <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}
            textColor={PortColors.text.primaryWhite}>
            Expired
          </NumberlessText>
        </Pressable>
      );
  }
}
const styles = StyleSheet.create({
  timeStampContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: MAX_WIDTH_CONTENT - 16,
    padding: 4,
    gap: 4,
  },
  receiveMessageStyle: {
    height: 50,
    width: MAX_WIDTH_CONTENT - 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: PortColors.primary.blue.app,
    marginTop: 4,
  },
  messageStyle: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: PortColors.primary.blue.app,
    width: MAX_WIDTH_CONTENT - 16,
    marginTop: 4,
  },
});
export default ContactBubble;
