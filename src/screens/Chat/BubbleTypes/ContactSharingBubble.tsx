import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import {
  ContactBundleParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
// import {useConnectionModal} from 'src/context/ConnectionModalContext';
// import {useErrorModal} from 'src/context/ErrorModalContext';
import {PortColors} from '@components/ComponentUtils';
import {useNavigation} from '@react-navigation/native';
import DirectChat from '@utils/DirectChats/DirectChat';
import {getReadPort} from '@utils/Ports';
import {PortBundle} from '@utils/Ports/interfaces';
import {useConnectionModal} from 'src/context/ConnectionModalContext';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {renderTimeStamp} from '../BubbleUtils';

enum ButtonState {
  undecided,
  connect,
  connecting,
  expired,
  message,
}

export default function ContactSharingBubble({
  message,
}: {
  message: SavedMessageParams;
}) {
  const navigation = useNavigation<any>();
  const {
    setFemaleModal,
    setConnectionQRData,
    showConnectionModal,
    setConnectionChannel,
  } = useConnectionModal();
  const {portConnectionError} = useErrorModal();
  const [buttonType, setButtonType] = useState<ButtonState>(
    ButtonState.undecided,
  );
  const [accepted, setAccepted] = useState<boolean | undefined>(undefined);
  const [goToChatId, setGoToChatId] = useState<string | undefined>(undefined);
  const [chatName, setChatName] = useState<string>(
    (message.data as ContactBundleParams).name || DEFAULT_NAME,
  );
  const handleConnect = async () => {
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
      const channel = 'shared://' + message.chatId + '://' + message.messageId;
      if (bundle) {
        setConnectionQRData(bundle);
        setFemaleModal(true);
        setConnectionChannel(channel);
        showConnectionModal();
      } else {
        portConnectionError();
      }
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
  if (message.sender) {
    return (
      <View>
        <View style={{paddingTop: 16, paddingHorizontal: 8, paddingBottom: 8}}>
          <NumberlessText fontSizeType={FontSizeType.m} fontType={FontType.md}>
            {chatName}
          </NumberlessText>
          <View style={styles.timeStampContainer}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              {'You have shared the contact of ' + chatName}
            </NumberlessText>
            {renderTimeStamp(message)}
          </View>
        </View>
        <Pressable onPress={handleNavigate} style={styles.messageStyle}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}
            textColor={PortColors.text.title}>
            Message
          </NumberlessText>
        </Pressable>
      </View>
    );
  } else {
    return (
      <View>
        <View style={{paddingTop: 16, paddingHorizontal: 8, paddingBottom: 8}}>
          <NumberlessText fontSizeType={FontSizeType.m} fontType={FontType.md}>
            {chatName}
          </NumberlessText>
          <View style={styles.timeStampContainer}>
            <NumberlessText
              fontSizeType={FontSizeType.s}
              fontType={FontType.rg}>
              {'You have been shared the contact of ' + chatName}
            </NumberlessText>
            {renderTimeStamp(message)}
          </View>
        </View>
        <GetButton clickHandle={handleConnect} buttonState={buttonType} />
      </View>
    );
  }
}

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
            textColor={PortColors.text.title}>
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
            textColor={PortColors.text.title}>
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
            textColor={PortColors.text.title}>
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
            textColor={PortColors.text.title}>
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
            textColor={PortColors.text.title}>
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
            textColor={PortColors.text.title}>
            Expired
          </NumberlessText>
        </Pressable>
      );
  }
}

const styles = StyleSheet.create({
  timeStampContainer: {
    marginTop: 4,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  connectButton: {
    marginTop: 10,
    marginLeft: -10,
    marginRight: -10,
    marginBottom: -6,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: PortColors.primary.white,
  },
  connectText: {
    color: PortColors.text.title,
  },
  receiveMessageStyle: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',

    //Used to prevent background overflow.
    marginHorizontal: -1,
    marginBottom: -1,
    borderBottomStartRadius: 12,
    borderBottomEndRadius: 12,
    backgroundColor: PortColors.primary.white,
  },
  messageStyle: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomStartRadius: 16,
    borderBottomEndRadius: 16,
    backgroundColor: PortColors.primary.messageBubble.receiver.blobBackground,
  },
});
