import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_AVATAR, DEFAULT_NAME} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';
import DirectChat from '@utils/DirectChats/DirectChat';
import {
  ContactBundleParams,
  SavedMessageParams,
} from '@utils/Messaging/interfaces';
import {getReadPort, processReadBundles, readBundle} from '@utils/Ports';
import {PortBundle, ReadPortData} from '@utils/Ports/interfaces';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {MAX_WIDTH_CONTENT, RenderTimeStamp} from '../BubbleUtils';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import DynamicColors from '@components/DynamicColors';

const ContactBubble = ({message}: {message: SavedMessageParams}) => {
  const navigation = useNavigation<any>();
  const [disconnected, setDisconnected] = useState(false);
  const [chatName, setChatName] = useState<string>(
    (message.data as ContactBundleParams).bundle?.name || DEFAULT_NAME,
  );
  const [authenticated, setAuthenticated] = useState(false);
  const [bundle, setBundle] = useState<ReadPortData | null>(null);

  useEffect(() => {
    (async () => {
      const getBundle = await getReadPort(
        (message.data as ContactBundleParams).bundle.portId,
      );
      setBundle(getBundle);
      if ((message.data as ContactBundleParams).createdChatId) {
        const chat = new DirectChat(
          (message.data as ContactBundleParams).createdChatId,
        );
        const chatData = await chat.getChatData();
        setChatName(chatData.name);
        setAuthenticated(chatData.authenticated);
        setDisconnected(chatData.disconnected);
      }
    })();
  }, [message]);

  const handleConnect = async () => {
    try {
      if (authenticated) {
        navigation.push('DirectChat', {
          chatId: (message.data as ContactBundleParams).createdChatId,
          isGroupChat: false,
          isConnected: !disconnected,
          isAuthenticated: authenticated,
        });
      } else {
        const bundle: PortBundle = (message.data as ContactBundleParams).bundle;
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

  const Colors = DynamicColors();

  return (
    <View style={{width: MAX_WIDTH_CONTENT - 16, padding: 4}}>
      <View style={styles.timeStampContainer}>
        <View
          style={{
            flexDirection: 'row',
            gap: 5,
          }}>
          <AvatarBox profileUri={DEFAULT_AVATAR} avatarSize="s" />

          <View style={{justifyContent: 'center'}}>
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}>
              {chatName}
            </NumberlessText>
            {message.sender && (
              <NumberlessText
                textColor={Colors.text.subtitle}
                fontSizeType={FontSizeType.s}
                fontType={FontType.rg}>
                Contact shared
              </NumberlessText>
            )}
          </View>
        </View>
      </View>

      <RenderTimeStamp message={message} />

      {!message.sender && (
        <>
          <LineSeparator />
          <GetButton
            clickHandle={handleConnect}
            bundle={bundle}
            createdChatId={message?.data?.createdChatId}
            accepted={message?.data?.accepted}
            authenticated={authenticated}
          />
        </>
      )}
    </View>
  );
};

function GetButton({
  clickHandle,
  bundle,
  accepted,
  createdChatId,
  authenticated,
}: {
  bundle: ReadPortData | null;
  accepted: boolean;
  createdChatId: string;
  clickHandle: () => void;
  authenticated: boolean;
}) {
  const Colors = DynamicColors();
  if (!accepted && !createdChatId) {
    return (
      <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}
          textColor={Colors.primary.accent}>
          Connect
        </NumberlessText>
      </Pressable>
    );
  } else if (createdChatId) {
    if (authenticated) {
      return (
        <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}
            textColor={Colors.primary.accent}>
            Message
          </NumberlessText>
        </Pressable>
      );
    } else {
      <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}
          textColor={Colors.primary.accent}>
          Connecting...
        </NumberlessText>
      </Pressable>;
    }
  } else if (bundle && accepted) {
    <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
      <NumberlessText
        fontSizeType={FontSizeType.m}
        fontType={FontType.md}
        textColor={Colors.primary.accent}>
        Connecting...
      </NumberlessText>
    </Pressable>;
  } else {
    <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
      <NumberlessText
        fontSizeType={FontSizeType.m}
        fontType={FontType.md}
        textColor={Colors.primary.accent}>
        Expired
      </NumberlessText>
    </Pressable>;
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
    paddingVertical: 5,
    width: MAX_WIDTH_CONTENT - 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 12,
    marginTop: 4,
  },
});
export default ContactBubble;
