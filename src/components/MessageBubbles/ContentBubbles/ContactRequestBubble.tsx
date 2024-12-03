import {
  FontSizeType,
  FontType,
  NumberlessText,
} from '@components/NumberlessText';
import {DEFAULT_NAME} from '@configs/constants';
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {MAX_WIDTH_CONTENT, RenderTimeStamp} from '../BubbleUtils';
import LineSeparator from '@components/Reusable/Separators/LineSeparator';
import {useNavigation} from '@react-navigation/native';
import DirectChat from '@utils/DirectChats/DirectChat';
import {useChatContext} from '@screens/DirectChat/ChatContext';
import {approveContactShareOnce} from '@utils/ContactSharing';

import DynamicColors from '@components/DynamicColors';
import useDynamicSVG from '@utils/Themes/createDynamicSVG';
import {LoadedMessage} from '@utils/Storage/DBCalls/lineMessage';

const ContactRequestBubble = ({message}: {message: LoadedMessage}) => {
  const [destination, setDestination] = useState(DEFAULT_NAME);

  const [requesterName, setRequesterName] = useState<string>(DEFAULT_NAME);
  const approved = message.data?.approved;

  const {chatId} = useChatContext();

  useEffect(() => {
    (async () => {
      try {
        setDestination(message.data.destinationName || DEFAULT_NAME);
        const dataHandler = new DirectChat(chatId);
        const chatData = await dataHandler.getChatData();
        setRequesterName(chatData.name);
      } catch (error) {
        console.error('Could not find chat data associated to chat Id:', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const onSettingsPressed = async () => {
    try {
      const dataHandler = new DirectChat(chatId);
      const chatData = await dataHandler.getChatData();
      navigation.push('ChatProfile', {
        chatId: chatId,
        chatData: chatData,
      });
    } catch (error) {
      console.error('Error navigating to contact profile page: ', error);
    }
  };

  const navigation = useNavigation();

  const onAllowOnceClicked = async () => {
    await approveContactShareOnce({
      approvedMessageId: message.messageId,
      requester: chatId,
      destinationName: message.data?.destinationName,
    });
  };

  const Colors = DynamicColors();
  const svgArray = [
    {
      assetName: 'ContactShareIcon',
      light: require('@assets/icons/ContactShareIcon.svg').default,
      dark: require('@assets/dark/icons/ContactShareIcon.svg').default,
    },
  ];

  const results = useDynamicSVG(svgArray);
  const Icon = results.ContactShareIcon;
  return (
    <View style={{padding: 8, paddingLeft: 4, width: MAX_WIDTH_CONTENT}}>
      {message.sender ? (
        <>
          <View style={{flexDirection: 'row', gap: 4}}>
            <Icon style={{marginTop: 6}} />
            {approved ? (
              <NumberlessText
                textColor={Colors.text.primary}
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                <NumberlessText
                  textColor={Colors.text.primary}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}>
                  {requesterName}'s{' '}
                </NumberlessText>
                contact was successfully shared with
                <NumberlessText
                  textColor={Colors.text.primary}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}>
                  {' '}
                  {destination}.
                </NumberlessText>
              </NumberlessText>
            ) : (
              <NumberlessText
                textColor={Colors.text.primary}
                fontSizeType={FontSizeType.m}
                fontType={FontType.rg}>
                You shared
                <NumberlessText
                  textColor={Colors.text.primary}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}>
                  {' '}
                  {requesterName}'s
                </NumberlessText>{' '}
                contact with
                <NumberlessText
                  textColor={Colors.text.primary}
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}>
                  {' '}
                  {destination}{' '}
                </NumberlessText>
                and it is awaiting their approval.
              </NumberlessText>
            )}
          </View>
          <View
            style={
              approved
                ? {
                    position: 'absolute',
                    bottom: 8,
                    right: 4,
                  }
                : {
                    marginTop: 2,
                  }
            }>
            <RenderTimeStamp message={message} />
          </View>
        </>
      ) : (
        <>
          {approved ? (
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}>
              {requesterName} shared your contact with {destination}
            </NumberlessText>
          ) : (
            <NumberlessText
              textColor={Colors.text.primary}
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}>
              {requesterName} tried to share your contact with {destination}.
              Allow {destination} to connect?
            </NumberlessText>
          )}

          <View style={{marginTop: 4, marginRight: 4, marginBottom: 4}}>
            <RenderTimeStamp message={message} />
          </View>
          {!approved && (
            <>
              <LineSeparator fromContactBubble={true} />

              <Pressable
                onPress={async () => await onAllowOnceClicked()}
                style={styles.receiveMessageStyle}>
                <NumberlessText
                  fontSizeType={FontSizeType.m}
                  fontType={FontType.md}
                  textColor={Colors.button.accent}>
                  Allow Once
                </NumberlessText>
              </Pressable>
            </>
          )}

          <LineSeparator fromContactBubble={true} />

          <Pressable
            onPress={() => onSettingsPressed()}
            style={styles.receiveMessageStyle}>
            <NumberlessText
              fontSizeType={FontSizeType.m}
              fontType={FontType.md}
              textColor={Colors.button.accent}>
              Manage Settings
            </NumberlessText>
          </Pressable>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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

export default ContactRequestBubble;
