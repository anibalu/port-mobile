import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_AVATAR, DEFAULT_NAME} from '@configs/constants';
import {useNavigation} from '@react-navigation/native';
import DirectChat from '@utils/DirectChats/DirectChat';
import {ContactBundleParams} from '@utils/Messaging/interfaces';
import {getReadPort, processReadBundles, readBundle} from '@utils/Ports';
import {PortBundle} from '@utils/Ports/interfaces';
import {ReadPortData} from '@utils/Storage/DBCalls/ports/readPorts';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {MAX_WIDTH_CONTENT, RenderTimeStamp} from '../BubbleUtils';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import DynamicColors from '@components/DynamicColors';
import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';

const ContactBubble = ({message}: {message: LoadedMessage}) => {
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
        try {
          const chatData = await chat.getChatData();
          setChatName(chatData.name);
          setAuthenticated(chatData.authenticated);
          setDisconnected(chatData.disconnected);
        } catch (error) {
          console.error('Created chat id not available: ', error);
        }
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
  const styles = styling(Colors);

  return (
    <View
      style={{
        width: MAX_WIDTH_CONTENT - 16,
        padding: 4,
      }}>
      <View style={styles.timeStampContainer}>
        <View
          style={{
            flexDirection: 'row',
            gap: 5,
          }}>
          <AvatarBox profileUri={DEFAULT_AVATAR} avatarSize="s" />

          <View style={{justifyContent: 'center', marginLeft: 5}}>
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
        <View
          style={{
            position: 'absolute',
            right: message.sender ? 8 : 16,
            bottom: 0,
          }}>
          <RenderTimeStamp message={message} />
        </View>
      </View>

      {!message.sender && (
        <>
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
  const styles = styling(Colors);
  if (!accepted && !createdChatId) {
    return (
      <>
        <LineSeparator fromContactBubble={true} />

        <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}
            textColor={Colors.primary.white}>
            Connect
          </NumberlessText>
        </Pressable>
      </>
    );
  } else if (createdChatId) {
    if (authenticated) {
      return (
        <>
          <LineSeparator fromContactBubble={true} />
          <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}
              textColor={Colors.primary.white}>
              Message
            </NumberlessText>
          </Pressable>
        </>
      );
    } else {
      <>
        <LineSeparator fromContactBubble={true} />
        <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
          <NumberlessText
            fontSizeType={FontSizeType.m}
            fontType={FontType.md}
            textColor={Colors.primary.white}>
            Connecting...
          </NumberlessText>
        </Pressable>
      </>;
    }
  } else if (bundle && accepted) {
    <>
      <LineSeparator fromContactBubble={true} />
      <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}
          textColor={Colors.primary.white}>
          Connecting...
        </NumberlessText>
      </Pressable>
    </>;
  } else {
    <>
      <LineSeparator fromContactBubble={true} />
      <Pressable onPress={clickHandle} style={styles.receiveMessageStyle}>
        <NumberlessText
          fontSizeType={FontSizeType.m}
          fontType={FontType.md}
          textColor={Colors.primary.white}>
          Expired
        </NumberlessText>
      </Pressable>
    </>;
  }
}
const styling = (Colors: any) =>
  StyleSheet.create({
    timeStampContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      width: MAX_WIDTH_CONTENT - 16,
      padding: 4,
      gap: 4,
    },
    receiveMessageStyle: {
      paddingVertical: 14,
      width: MAX_WIDTH_CONTENT - 32,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      borderRadius: 12,
      marginTop: 4,
      backgroundColor: Colors.primary.accent,
    },
  });
export default ContactBubble;
