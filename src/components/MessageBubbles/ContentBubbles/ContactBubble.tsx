import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';

import {DEFAULT_AVATAR, DEFAULT_NAME} from '@configs/constants';

import DirectChat from '@utils/DirectChats/DirectChat';
import {ContactBundleParams} from '@utils/Messaging/interfaces';
import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';

import {ToastType, useToast} from 'src/context/ToastContext';

import {
  MAX_WIDTH_CONTENT,
  RenderTimeStamp,
  attemptConnect,
} from '../BubbleUtils';


const ContactBubble = ({message}: {message: LoadedMessage}) => {
  const navigation = useNavigation<any>();
  const {showToast} = useToast();
  const [chatName, setChatName] = useState<string>(
    (message.data as ContactBundleParams).bundle.name || DEFAULT_NAME,
  );
  const [connecting, setConnecting] = useState<boolean>(false);
  //this is toggled to true if created chat Id is that of a deleted chat.
  const [deletedChat, setDeletedChat] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        if (message?.data?.createdChatId) {
          const chat = new DirectChat(message?.data?.createdChatId);
          const chatData = await chat.getChatData();
          setChatName(chatData.name || DEFAULT_NAME);
        }
      } catch (error) {
        setDeletedChat(true);
        console.log('Error running contact bubble initial effect: ', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    try {
      if (!message?.data?.accepted && !message?.data?.createdChatId) {
        setConnecting(true);
        const bundle = (message.data as ContactBundleParams).bundle;
        if (bundle) {
          await attemptConnect(bundle, message);
        } else {
          throw new Error('No Bundle');
        }
      } else if (message?.data?.createdChatId) {
        const chatHandler = new DirectChat(message.data.createdChatId);
        const chatData = await chatHandler.getChatData();
        navigation.push('DirectChat', {
          chatId: message.data.createdChatId,
          isConnected: !chatData.disconnected,
          isAuthenticated: chatData.authenticated,
          name: chatData.name,
          profileUri: chatData.displayPic,
        });
      } else {
        console.log('Clicked on contact bundle in unusable state.');
      }
    } catch (error) {
      console.log('Error connecting over shared contact', error);
      showToast('Shared contact port has expired', ToastType.error);
    }
    setConnecting(false);
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
          <LineSeparator fromContactBubble={true} />
          <Pressable
            onPress={handleConnect}
            style={styles.receiveMessageStyle}
            disabled={connecting}>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}
              textColor={Colors.primary.white}>
              {connecting
                ? 'Connecting...'
                : !message?.data?.accepted && !message?.data?.createdChatId
                ? 'Connect'
                : message?.data?.createdChatId && !deletedChat
                ? 'Message'
                : message?.data?.accepted && !deletedChat
                ? 'Connecting...'
                : 'Expired'}
            </NumberlessText>
          </Pressable>
        </>
      )}
    </View>
  );
};

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
