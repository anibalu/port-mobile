import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import DynamicColors from '@components/DynamicColors';
import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {AvatarBox} from '@components/Reusable/AvatarBox/AvatarBox';

import {DEFAULT_AVATAR, DEFAULT_NAME} from '@configs/constants';

import DirectChat from '@utils/DirectChats/DirectChat';
import {ContactBundleRequestInfoParams} from '@utils/Messaging/interfaces';
import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';
import {permanentlyDeleteMessage} from '@utils/Storage/messages';

import {MAX_WIDTH_CONTENT, RenderTimeStamp} from '../BubbleUtils';

const ContactInfoBubble = ({message}: {message: LoadedMessage}) => {
  const [createdChatId, setCreatedChatId] = useState<string | undefined>(
    undefined,
  );
  const [chatName, setChatName] = useState<string>(DEFAULT_NAME);

  useEffect(() => {
    setCreatedChatId((message.data as ContactBundleRequestInfoParams).source);
    (async () => {
      if (message.data.shared) {
        await permanentlyDeleteMessage(message.chatId, message.messageId);
      }
    })();
  }, [message]);

  useEffect(() => {
    (async () => {
      try {
        if (createdChatId) {
          const chat = new DirectChat(createdChatId);
          const chatData = await chat.getChatData();
          setChatName(chatData.name);
        }
      } catch (error) {
        console.error(
          'No chat associated with created chat Id: ',
          createdChatId,
        );
      }
    })();
  }, [createdChatId]);
  const Colors = DynamicColors();

  return (
    <View style={{padding: 8, width: MAX_WIDTH_CONTENT - 16}}>
      <View style={styles.toprow}>
        <AvatarBox profileUri={DEFAULT_AVATAR} avatarSize="s" />
        <View>
          <NumberlessText
            textColor={Colors.text.primary}
            fontSizeType={FontSizeType.l}
            fontType={FontType.md}>
            {chatName}
          </NumberlessText>
          <NumberlessText
            textColor={Colors.text.subtitle}
            fontSizeType={FontSizeType.m}
            fontType={FontType.rg}>
            Awaiting permission
          </NumberlessText>
        </View>
      </View>
      <NumberlessText
        textColor={Colors.text.subtitle}
        fontSizeType={FontSizeType.m}
        fontType={FontType.rg}>
        {chatName} may have disabled contact sharing. They can approve this
        request at any time.
      </NumberlessText>
      <View
        style={{
          marginRight: 16,
        }}>
        <RenderTimeStamp showReadReceipts={false} message={message} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toprow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
});

export default ContactInfoBubble;
