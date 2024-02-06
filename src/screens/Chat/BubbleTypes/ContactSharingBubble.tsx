import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {
  ContactBundleParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {getTimeStamp} from '@utils/Time';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {DEFAULT_NAME} from '@configs/constants';
import {GenericButton} from '@components/GenericButton';
// import {useConnectionModal} from 'src/context/ConnectionModalContext';
// import {useErrorModal} from 'src/context/ErrorModalContext';
import {PortBundle} from '@utils/Ports/interfaces';
import {getReadPort} from '@utils/Ports';
import {useNavigation} from '@react-navigation/native';
import DirectChat from '@utils/DirectChats/DirectChat';
import {useConnectionModal} from 'src/context/ConnectionModalContext';
import {useErrorModal} from 'src/context/ErrorModalContext';
import {PortColors} from '@components/ComponentUtils';

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
      <Pressable style={styles.textBubbleContainer}>
        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}
          textColor={PortColors.text.primary}
          style={styles.text}>
          {'You have shared the contact of ' +
            ((message.data as ContactBundleParams).name || DEFAULT_NAME)}
        </NumberlessText>
        <View style={styles.timeStampContainer}>
          <View>
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.xs}
              textColor={PortColors.text.secondary}>
              {getTimeStamp(message.timestamp)}
            </NumberlessText>
          </View>
        </View>
      </Pressable>
    );
  } else {
    return (
      <View style={styles.textBubbleContainer}>
        <NumberlessText
          fontType={FontType.rg}
          fontSizeType={FontSizeType.m}
          textColor={PortColors.text.primary}
          style={styles.text}>
          {'You have been shared the contact of ' +
            ((message.data as ContactBundleParams).name || DEFAULT_NAME)}
        </NumberlessText>
        <View style={styles.timeStampContainer}>
          <View>
            <NumberlessText
              fontType={FontType.rg}
              fontSizeType={FontSizeType.xs}
              textColor={PortColors.text.secondary}>
              {getTimeStamp(message.timestamp)}
            </NumberlessText>
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
        <GenericButton
          onPress={clickHandle}
          textStyle={{color: PortColors.text.title}}
          buttonStyle={styles.connectButton}>
          Connect
        </GenericButton>
      );
    case ButtonState.connecting:
      return (
        <GenericButton
          onPress={() => {}}
          textStyle={{color: PortColors.text.title}}
          buttonStyle={styles.connectButton}>
          Connecting...
        </GenericButton>
      );
    case ButtonState.expired:
      return (
        <GenericButton
          onPress={() => {}}
          textStyle={{color: PortColors.text.title}}
          buttonStyle={styles.connectButton}>
          expired
        </GenericButton>
      );
    case ButtonState.undecided:
      return (
        <GenericButton
          onPress={() => {}}
          textStyle={{color: PortColors.text.title}}
          buttonStyle={styles.connectButton}>
          expired
        </GenericButton>
      );
    case ButtonState.message:
      return (
        <GenericButton
          onPress={clickHandle}
          textStyle={{color: PortColors.text.title}}
          buttonStyle={styles.connectButton}>
          message
        </GenericButton>
      );
    default:
      return (
        <GenericButton
          onPress={() => {}}
          textStyle={{color: PortColors.text.title}}
          buttonStyle={styles.connectButton}>
          expired
        </GenericButton>
      );
  }
}

const styles = StyleSheet.create({
  textBubbleContainer: {
    width: '100%',
  },
  groupName: {
    fontSize: 17,
    color: 'black',
  },
  groupInvite: {
    fontSize: 12,
  },
  inviteMessage: {
    fontSize: 12,
    color: 'black',
    marginTop: 15,
  },
  timeStampContainer: {
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  failedStamp: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  text: {
    marginTop: 10,
  },
  buttonContainer: {
    backgroundColor: '#D2F2FF',
    paddingVertical: 12,
    justifyContent: 'center',
    marginHorizontal: -20,
    marginBottom: -5,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: '#547CEF',
    fontSize: 15,
  },
  connectButton: {
    marginTop: 10,
    marginLeft: -6,
    marginRight: -6,
    marginBottom: -6,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: 'white',
  },
});
